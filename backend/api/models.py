from django.db import models

class User(models.Model):
    user_id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    mobile_number = models.CharField(max_length=15, unique=True)
    password = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'  # Link to your existing table

from django.db import models


class MainCategory(models.Model):
    main_category_id = models.AutoField(primary_key=True)
    main_category_name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    image = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'main_categories'
        verbose_name = 'Main Category'
        verbose_name_plural = 'Main Categories'

    def __str__(self):
        return self.main_category_name


class Category(models.Model):
    category_id = models.AutoField(primary_key=True)
    main_category = models.ForeignKey(
        MainCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='categories'
    )
    category_name = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    image = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'categories'
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.category_name



class SubCategory(models.Model):
    sub_category_id = models.AutoField(primary_key=True)
    category = models.ForeignKey(
        Category, 
        on_delete=models.CASCADE,
        related_name='sub_categories'
    )
    sub_category_name = models.CharField(max_length=150)
    description = models.TextField(null=True, blank=True)
    image = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sub_categories'

    def __str__(self):
        return self.sub_category_name


class Item(models.Model):
    item_id = models.AutoField(primary_key=True)
    category = models.ForeignKey(
        Category, 
        on_delete=models.CASCADE,
        related_name='items'
    )
    sub_category = models.ForeignKey(
        SubCategory, 
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='items'
    )
    item_name = models.CharField(max_length=150)
    description = models.TextField(null=True, blank=True)
    actual_price = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stock_quantity = models.IntegerField(default=0)
    image = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_new = models.IntegerField(default=0)        # 0 = True (new), 1 = False
    is_trending = models.IntegerField(default=0)   # 0 = True (trending), 1 = False
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    best_sales = models.IntegerField(default=0)

    class Meta:
        db_table = 'items'

    # Optional: Properties to handle inverted logic
    @property
    def new(self):
        return self.is_new == 0

    @new.setter
    def new(self, value: bool):
        self.is_new = 0 if value else 1

    @property
    def trending(self):
        return self.is_trending == 0

    @trending.setter
    def trending(self, value: bool):
        self.is_trending = 0 if value else 1

    def __str__(self):
        return self.item_name


class Cart(models.Model):
    cart_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id', related_name='cart_items')
    item = models.ForeignKey(Item, on_delete=models.CASCADE, db_column='item_id', related_name='in_carts')
    quantity = models.IntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'cart'


class Wishlist(models.Model):
    wishlist_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id', related_name='wishlist_items')
    item = models.ForeignKey(Item, on_delete=models.CASCADE, db_column='item_id', related_name='wishlisted_in')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'wishlist'


# ---- Orders (mapped to existing tables) ----
class Order(models.Model):
    order_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id', related_name='orders')
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    order_status = models.CharField(max_length=10, default='pending')  # enum handled in DB
    booked_reference = models.CharField(max_length=50, null=True, blank=True)
    ordered_date = models.DateTimeField(auto_now_add=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    discount_code_id = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'orders'
        managed = False  # Table already exists in DB


class OrderItem(models.Model):
    order_item_id = models.AutoField(primary_key=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, db_column='order_id', related_name='items')
    item = models.ForeignKey(Item, on_delete=models.CASCADE, db_column='item_id', related_name='order_items')
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'order_items'
        managed = False

class Payment(models.Model):
    id = models.AutoField(primary_key=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, db_column='order_id', related_name='payments')
    provider = models.CharField(max_length=50, default='razorpay')
    provider_order_id = models.CharField(max_length=100, null=True, blank=True)
    provider_payment_id = models.CharField(max_length=100, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='INR')
    status = models.CharField(max_length=20, choices=[
        ('created', 'Created'),
        ('authorized', 'Authorized'),
        ('captured', 'Captured'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded')
    ])
    method = models.CharField(max_length=50, null=True, blank=True)
    upi_vpa = models.CharField(max_length=100, null=True, blank=True)
    card_last4 = models.CharField(max_length=4, null=True, blank=True)
    card_network = models.CharField(max_length=50, null=True, blank=True)
    bank = models.CharField(max_length=100, null=True, blank=True)
    captured = models.BooleanField(default=False)
    error_code = models.CharField(max_length=50, null=True, blank=True)
    error_description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'payments'
        managed = False  # Table already exists in DB


class RazorpayWebhookLog(models.Model):
    id = models.AutoField(primary_key=True)
    event_type = models.CharField(max_length=100)
    payload_text = models.TextField()
    headers = models.TextField(null=True, blank=True)
    signature = models.CharField(max_length=255, null=True, blank=True)
    verified = models.BooleanField(default=False)
    processed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'razorpay_webhook_logs'
        managed = False  # Table already exists in DB
