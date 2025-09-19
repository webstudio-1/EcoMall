from django.urls import path
from . import views
from .views import (
    BestSaleItemList, NewArrivalItemList, TrendingItemList, ItemDetailView,
    CartListCreateView, CartItemView, WishlistListCreateView, WishlistItemView,
    MainCategoryTree, ItemsBySubCategory
)
urlpatterns = [
    path('register/', views.register_user),
    path('login/', views.login_user),
    path('items/best-sale/', BestSaleItemList.as_view(), name='best-sale-items'),
    path('items/new-arrivals/', NewArrivalItemList.as_view(), name='new-arrival-items'),
    path('items/trending/', TrendingItemList.as_view(), name='trending-items'),
    path('items/<int:item_id>/', ItemDetailView.as_view(), name='item-detail'),
    # cart
    path('cart/', CartListCreateView.as_view(), name='cart-list-create'),
    path('cart/<int:cart_id>/', CartItemView.as_view(), name='cart-item'),
    # wishlist
    path('wishlist/', WishlistListCreateView.as_view(), name='wishlist-list-create'),
    path('wishlist/<int:wishlist_id>/', WishlistItemView.as_view(), name='wishlist-item'),
    # header menu
    path('menu/tree/', MainCategoryTree.as_view(), name='menu-tree'),
    path('menu/subcategories/<int:sub_category_id>/items/', ItemsBySubCategory.as_view(), name='items-by-subcategory'),
    # orders
    path("create-order/", views.create_order, name="create-order"),
    path('create-razorpay-order/', views.create_razorpay_order, name='create_razorpay_order'),
    path('verify-payment/', views.verify_payment, name='verify_payment'),
    path('payment-pending/', views.payment_pending, name='payment_pending'),
    path('payment-failed/', views.payment_failed, name='payment_failed'),
    path('invoice/<int:order_id>/pdf/', views.invoice_pdf, name='invoice-pdf'),
  
]
