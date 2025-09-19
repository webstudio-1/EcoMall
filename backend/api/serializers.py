from rest_framework import serializers
from .models import User
from .models import Item, Cart, Wishlist, MainCategory, Category, SubCategory

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

    # Note: Passwords are stored as provided (no hashing) per current requirement.
    # For production systems, always hash passwords using Django's password hashers.
    def create(self, validated_data):
        return super().create(validated_data)


class ItemMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = [
            'item_id',
            'item_name',
            'selling_price',
            'category',
            'sub_category',
            'image'
        ]


class ItemDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = '__all__'


class CartSerializer(serializers.ModelSerializer):
    # Include handy item fields for UI
    item_name = serializers.CharField(source='item.item_name', read_only=True)
    image = serializers.CharField(source='item.image', read_only=True)
    selling_price = serializers.DecimalField(source='item.selling_price', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Cart
        fields = ['cart_id', 'user', 'item', 'quantity', 'added_at', 'item_name', 'image', 'selling_price']


class WishlistSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.item_name', read_only=True)
    image = serializers.CharField(source='item.image', read_only=True)
    selling_price = serializers.DecimalField(source='item.selling_price', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Wishlist
        fields = ['wishlist_id', 'user', 'item', 'added_at', 'item_name', 'image', 'selling_price']


# -------- Header Menu Serializers (Nested) --------
class SubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SubCategory
        fields = ['sub_category_id', 'sub_category_name']


class CategoryWithSubsSerializer(serializers.ModelSerializer):
    sub_categories = SubCategorySerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ['category_id', 'category_name', 'sub_categories']


class MainCategoryNestedSerializer(serializers.ModelSerializer):
    categories = CategoryWithSubsSerializer(many=True, read_only=True)

    class Meta:
        model = MainCategory
        fields = ['main_category_id', 'main_category_name', 'categories']
