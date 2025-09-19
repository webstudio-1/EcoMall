from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.views import APIView
from .models import User, Item, Cart, Wishlist, MainCategory, Category, SubCategory, Order, OrderItem, Payment
from .serializers import (
    ItemMinimalSerializer, ItemDetailSerializer,
    WishlistSerializer, CartSerializer,
    MainCategoryNestedSerializer, CategoryWithSubsSerializer
)
from django.db import utils as db_utils
from django.shortcuts import get_object_or_404



@api_view(['POST'])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        user_data = {
            "user_id": user.user_id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "mobile_number": user.mobile_number,
        }
        return Response({"message": "User registered successfully", "user": user_data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from django.contrib.auth.hashers import check_password


@api_view(['POST', 'GET'])
def login_user(request):
    try:
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)

        stored = user.password or ""
        # Detect if stored password appears hashed by Django hashers
        is_hashed = (
            stored.startswith('pbkdf2_') or
            stored.startswith('bcrypt') or
            stored.startswith('scrypt$') or
            stored.startswith('argon2')
        )

        ok = False
        if is_hashed:
            ok = check_password(password, stored)
        else:
            # Fallback for legacy/plaintext passwords in DB
            ok = (password == stored)

        if ok:
            # Success response WITH user details
            user_data = {
                "user_id": user.user_id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "mobile_number": user.mobile_number,
            }
            return Response({"message": "Login successful", "user": user_data}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": "Internal server error", "detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Best Sale Products
class BestSaleItemList(generics.ListAPIView):
    serializer_class = ItemMinimalSerializer

    def get_queryset(self):
        return Item.objects.filter(best_sales=1)


# New Arrivals
class NewArrivalItemList(generics.ListAPIView):
    serializer_class = ItemMinimalSerializer

    def get_queryset(self):
        return Item.objects.filter(is_new=1)


# Popular Combos / Trending
class TrendingItemList(generics.ListAPIView):
    serializer_class = ItemMinimalSerializer

    def get_queryset(self):
        return Item.objects.filter(is_trending=1)

# Product detail by item_id
class ItemDetailView(generics.RetrieveAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemDetailSerializer
    lookup_field = 'item_id'


# -------------------- CART APIS --------------------
class CartListCreateView(APIView):
    def get(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            items = Cart.objects.filter(user_id=user_id).select_related('item')
            ser = CartSerializer(items, many=True)
            return Response(ser.data)
        except db_utils.OperationalError as e:
            return Response({"error": "Database unavailable", "detail": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    def post(self, request):
        user_id = request.data.get('user_id')
        item_id = request.data.get('item_id')
        quantity = int(request.data.get('quantity') or 1)
        if not user_id or not item_id:
            return Response({"error": "user_id and item_id are required"}, status=status.HTTP_400_BAD_REQUEST)
        # Upsert on duplicate
        try:
            obj, created = Cart.objects.get_or_create(user_id=user_id, item_id=item_id, defaults={'quantity': quantity})
            if not created:
                # Increment existing quantity
                obj.quantity = int(obj.quantity or 0) + quantity
                obj.save()
            ser = CartSerializer(obj)
            return Response(ser.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        except db_utils.OperationalError as e:
            return Response({"error": "Database unavailable", "detail": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)


class CartItemView(APIView):
    def patch(self, request, cart_id):
        try:
            obj = Cart.objects.get(cart_id=cart_id)
        except Cart.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        quantity = request.data.get('quantity')
        if quantity is None:
            return Response({"error": "quantity is required"}, status=status.HTTP_400_BAD_REQUEST)
        obj.quantity = int(quantity)
        obj.save()
        return Response(CartSerializer(obj).data)

    def delete(self, request, cart_id):
        try:
            obj = Cart.objects.get(cart_id=cart_id)
        except Cart.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        obj.delete()
        # 204 responses MUST NOT include a body
        return Response(status=status.HTTP_204_NO_CONTENT)


# -------------------- HEADER MENU APIS --------------------
class MainCategoryTree(APIView):
    """Returns all main categories with nested categories and subcategories.
    Response shape:
    [
      {
        "main_category_id": 1,
        "main_category_name": "Eco Products",
        "categories": [
          { "category_id": 10, "category_name": "Toys & Games", "sub_categories": [ ... ] },
          ...
        ]
      },
      ...
    ]
    """
    def get(self, request):
        mains = MainCategory.objects.prefetch_related(
            'categories__sub_categories'
        ).all().order_by('main_category_name')
        data = MainCategoryNestedSerializer(mains, many=True).data
        return Response(data)

class ItemsBySubCategory(APIView):
    """Returns all items under a specific subcategory"""
    def get(self, request, sub_category_id: int):
        items = Item.objects.filter(sub_category_id=sub_category_id).order_by('item_name')
        data = [
            {
                "item_id": i.item_id,
                "item_name": i.item_name,
                "selling_price": i.selling_price,
                "image": i.image,
            }
            for i in items
        ]
        return Response(data)

# -------------------- WISHLIST APIS --------------------
class WishlistListCreateView(APIView):
    def get(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            items = Wishlist.objects.filter(user_id=user_id).select_related('item')
            ser = WishlistSerializer(items, many=True)
            return Response(ser.data)
        except db_utils.OperationalError as e:
            return Response({"error": "Database unavailable", "detail": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    def post(self, request):
        user_id = request.data.get('user_id')
        item_id = request.data.get('item_id')
        if not user_id or not item_id:
            return Response({"error": "user_id and item_id are required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            obj, created = Wishlist.objects.get_or_create(user_id=user_id, item_id=item_id)
            ser = WishlistSerializer(obj)
            return Response(ser.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        except db_utils.OperationalError as e:
            return Response({"error": "Database unavailable", "detail": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)


class WishlistItemView(APIView):
    def delete(self, request, wishlist_id):
        try:
            obj = Wishlist.objects.get(wishlist_id=wishlist_id)
        except Wishlist.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        obj.delete()
        # 204 responses MUST NOT include a body
        return Response(status=status.HTTP_204_NO_CONTENT)
import hashlib
import razorpay
from decimal import Decimal
from django.template.loader import render_to_string
from django.http import HttpResponse
from xhtml2pdf import pisa
from io import BytesIO
from datetime import datetime
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

# Razorpay Client
razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


@api_view(['POST'])
def create_order(request):
    """Creates a DB order with items and a corresponding Razorpay order.
    Body: { user_id, items:[{item_id,quantity,price}], total_amount }
    Returns: { order_id, razorpay_order_id, amount, currency }
    """
    try:
        user_id = request.data.get("user_id")
        items = request.data.get("items") or []
        total_amount = request.data.get("total_amount")

        if not user_id or not items or total_amount is None:
            return Response({"error": "user_id, items and total_amount are required"}, status=status.HTTP_400_BAD_REQUEST)

        total_amount_dec = Decimal(str(total_amount))

        # Create order (pending)
        order = Order.objects.create(
            user_id=user_id,
            total_price=total_amount_dec,
            order_status='pending'
        )

        # Create order items
        for item in items:
            OrderItem.objects.create(
                order=order,
                item_id=item.get("item_id"),
                quantity=int(item.get("quantity") or 1),
                price=Decimal(str(item.get("price") or 0))
            )

        # Create Razorpay Order (amount in paise)
        razorpay_order = razorpay_client.order.create({
            "amount": int(total_amount_dec * 100),
            "currency": "INR",
            "payment_capture": 1
        })

        # Save payment record
        Payment.objects.create(
            order=order,
            provider_order_id=razorpay_order["id"],
            amount=total_amount_dec,
            status="created",
            currency="INR"
        )

        return Response({
            "order_id": order.order_id,
            "razorpay_order_id": razorpay_order["id"],
            "amount": float(total_amount_dec),
            "currency": "INR",
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# 1️⃣ Create Razorpay Order
@csrf_exempt
@api_view(['POST'])
def create_razorpay_order(request):
    try:
        data = request.data
        order_id = data.get('order_id')
        amount = data.get('amount')

        if not order_id or amount is None:
            return Response({'error': 'order_id and amount are required.'}, status=status.HTTP_400_BAD_REQUEST)

        order = get_object_or_404(Order, order_id=order_id)

        razorpay_order = razorpay_client.order.create({
            'amount': int(Decimal(str(amount)) * 100),
            'currency': 'INR',
            'receipt': str(order_id),
            'payment_capture': 1
        })

        Payment.objects.create(
            order=order,
            provider_order_id=razorpay_order['id'],
            amount=Decimal(str(amount)),
            status="created",
            currency='INR'
        )

        return Response({
            'order_id': order_id,
            'razorpay_order_id': razorpay_order['id'],
            'amount': float(amount),
            'currency': 'INR'
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# 2️⃣ Verify & Capture Payment
@csrf_exempt
@api_view(['POST'])
def verify_payment(request):
    try:
        data = request.data
        razorpay_order_id = data.get('razorpay_order_id')
        razorpay_payment_id = data.get('razorpay_payment_id')
        razorpay_signature = data.get('razorpay_signature')

        if not razorpay_order_id or not razorpay_payment_id or not razorpay_signature:
            return Response({'error': 'Missing payment details'}, status=400)

        # ✅ Verify signature using Razorpay utility
        params_dict = {
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        }
        try:
            razorpay_client.utility.verify_payment_signature(params_dict)
        except razorpay.errors.SignatureVerificationError:
            return Response({'error': 'Payment verification failed'}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ Update Payment
        payment = Payment.objects.get(provider_order_id=razorpay_order_id)
        payment.provider_payment_id = razorpay_payment_id
        payment.status = "captured"
        payment.captured = True
        payment.save()

        # ✅ Update Order
        order = payment.order
        order.order_status = "confirmed"
        order.save()

        return Response({
            'success': True,
            'order_id': order.order_id,
            'payment_id': razorpay_payment_id,
            'status': 'captured'
        })

    except Payment.DoesNotExist:
        return Response({'error': 'Payment record not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


# -------- Invoice PDF (xhtml2pdf) --------
@require_GET
def invoice_pdf(request, order_id: int):
    """Generate and download invoice PDF with improved formatting using xhtml2pdf."""
    order = get_object_or_404(Order, order_id=order_id)
    items = order.items.select_related('item').all()
    payment = Payment.objects.filter(order=order).order_by('-created_at').first()

    subtotal = sum([float(oi.price) * (oi.quantity or 1) for oi in items])

    payment_block = ''
    if payment:
        payment_block = f'''
        <h3>Payment Details</h3>
        <table class="payment-table">
            <tr><td>Payment ID:</td><td>{payment.id}</td></tr>
            <tr><td>Status:</td><td>{payment.status}</td></tr>
            <tr><td>Method:</td><td>{payment.method or ''}</td></tr>
            <tr><td>Razorpay Order:</td><td>{payment.provider_order_id or ''}</td></tr>
            <tr><td>Razorpay Payment:</td><td>{payment.provider_payment_id or ''}</td></tr>
            <tr><td>Amount:</td><td>₹ {float(payment.amount):.2f}</td></tr>
        </table>
        '''

    html = f'''
        <html>
        <head>
        <meta charset="UTF-8">
        <style>
        body {{
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #333;
            margin: 20px;
        }}
        h2 {{
            text-align: center;
            color: #004080;
            margin-bottom: 2px;
        }}
        h4 {{
            text-align: center;
            margin-top: 0;
            margin-bottom: 15px;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
        }}
        th, td {{
            border: 1px solid #bbb;
            padding: 8px;
            text-align: left;
        }}
        th {{
            background-color: #f0f0f0;
        }}
        td.right {{ text-align: right; }}
        td.center {{ text-align: center; }}
        .no-border td {{ border: none; padding: 4px; }}
        .payment-table td {{ border: 1px solid #bbb; padding: 6px; }}
        .summary-table td {{ border: none; padding: 4px; }}
        .footer {{
            margin-top: 20px;
            font-size: 10px;
            color: #666;
            text-align: center;
        }}
        </style>
        </head>
        <body>

        <h2>Eco Mall</h2>
        <h4>Invoice</h4>

        <table class="no-border">
        <tr>
        <td class="no-border">
        <strong>Order ID:</strong> {order.order_id}<br>
        {f'<strong>Reference:</strong> {order.booked_reference}<br>' if getattr(order, 'booked_reference', None) else ''}
        <strong>Date:</strong> {datetime.now().strftime('%d %b %Y %H:%M')}<br>
        </td>
        <td class="no-border" style="text-align:right;">
        <strong>Eco Mall</strong><br>
        123, Green Street<br>
        City, State - ZIP<br>
        Phone: +91-XXXXXXXXXX
        </td>
        </tr>
        </table>

        <h3>Items</h3>
        <table>
        <thead>
        <tr>
        <th style="width:55%">Item</th>
        <th class="center" style="width:10%">Qty</th>
        <th class="right" style="width:17%">Unit Price</th>
        <th class="right" style="width:18%">Amount</th>
        </tr>
        </thead>
        <tbody>
        {''.join([
            f"<tr><td>{oi.item.item_name}</td><td class='center'>{oi.quantity}</td><td class='right'>₹{float(oi.price):.2f}</td><td class='right'>₹{float(oi.price)*(oi.quantity or 1):.2f}</td></tr>"
            for oi in items
        ])}
        </tbody>
        </table>

        <table class="summary-table" style="width:100%; margin-top:10px;">
        <tr>
        <td style="width:60%;"></td>
        <td style="width:40%;">
        <table>
        <tr><td>Subtotal:</td><td class="right">₹{subtotal:.2f}</td></tr>
        <tr><td><strong>Total:</strong></td><td class="right"><strong>₹{float(order.total_price):.2f}</strong></td></tr>
        </table>
        </td>
        </tr>
        </table>

        {'<h3>Payment Details</h3>' if payment else ''}
        {f'''
        <table class="payment-table">
        {f"<tr><td>Payment ID</td><td>{payment.id}</td></tr>" if payment.id else ""}
        {f"<tr><td>Status</td><td>{payment.status}</td></tr>" if payment.status else ""}
        {f"<tr><td>Method</td><td>{payment.method}</td></tr>" if payment.method else ""}
        {f"<tr><td>Razorpay Order</td><td>{payment.provider_order_id}</td></tr>" if payment.provider_order_id else ""}
        {f"<tr><td>Razorpay Payment</td><td>{payment.provider_payment_id}</td></tr>" if payment.provider_payment_id else ""}
        {f"<tr><td>Amount</td><td>₹{float(payment.amount):.2f}</td></tr>" if payment.amount else ""}
        </table>
        ''' if payment else ''}

        <div class="footer">
        This is a computer-generated invoice and does not require a signature.<br>
        Thank you for shopping with Eco Mall!
        </div>

        </body>
        </html>
        '''

    result = BytesIO()
    pisa_status = pisa.CreatePDF(html, dest=result)
    if pisa_status.err:
        return HttpResponse("Error generating PDF", status=500)

    response = HttpResponse(result.getvalue(), content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="invoice_{order.order_id}.pdf"'
    return response

# 3️⃣ Mark Payment as Pending
@csrf_exempt
@api_view(['POST'])
def payment_pending(request):
    try:
        order_id = request.data.get('order_id')
        order = Order.objects.filter(order_id=order_id).first()
        if not order:
            return Response({'error': 'Order not found'}, status=404)

        order.order_status = "pending"
        order.save()

        Payment.objects.filter(order=order).update(status="pending")

        return Response({
            'status': 'pending',
            'message': f'Payment for Order {order_id} is pending.'
        })

    except Exception as e:
        return Response({'error': str(e)}, status=500)


# 4️⃣ Mark Payment as Failed
@csrf_exempt
@api_view(['POST'])
def payment_failed(request):
    try:
        order_id = request.data.get('order_id')
        order = Order.objects.filter(order_id=order_id).first()
        if not order:
            return Response({'error': 'Order not found'}, status=404)

        order.order_status = "failed"
        order.save()

        Payment.objects.filter(order=order).update(status="failed")

        return Response({
            'status': 'failed',
            'message': f'Payment for Order {order_id} failed.'
        })

    except Exception as e:
        return Response({'error': str(e)}, status=500)