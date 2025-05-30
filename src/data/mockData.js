// Dữ liệu mẫu cho sản phẩm
export const products = [
  {
    id: '1',
    name: 'Kem dưỡng da Cerave',
    category: 'Skincare',
    price: 350000,
    stock: 50,
    image: 'https://example.com/cerave.jpg',
    description: 'Kem dưỡng ẩm cho da khô và nhạy cảm',
    barcode: '123456789',
    supplier: 'Công ty TNHH Mỹ phẩm ABC',
    expiryDate: '2025-12-31',
  },
  {
    id: '2',
    name: 'Serum Vitamin C',
    category: 'Skincare',
    price: 450000,
    stock: 30,
    image: 'https://example.com/vitaminc.jpg',
    description: 'Serum làm sáng da với Vitamin C',
    barcode: '987654321',
    supplier: 'Công ty TNHH Mỹ phẩm XYZ',
    expiryDate: '2025-06-30',
  },
  {
    id: '3',
    name: 'Sữa rửa mặt Cetaphil',
    category: 'Cleanser',
    price: 280000,
    stock: 45,
    image: 'https://example.com/cetaphil.jpg',
    description: 'Sữa rửa mặt dịu nhẹ cho mọi loại da',
    barcode: '456789123',
    supplier: 'Công ty TNHH Dược phẩm DEF',
    expiryDate: '2025-09-30',
  }
];

// Dữ liệu mẫu cho danh mục
export const categories = [
  { id: '1', name: 'Skincare', icon: '💆‍♀️' },
  { id: '2', name: 'Cleanser', icon: '🧼' },
  { id: '3', name: 'Makeup', icon: '💄' },
  { id: '4', name: 'Haircare', icon: '💇‍♀️' },
  { id: '5', name: 'Bodycare', icon: '🛁' }
];

// Dữ liệu mẫu cho đơn hàng
export const orders = [
  {
    id: '1',
    customerName: 'Nguyễn Văn A',
    phone: '0123456789',
    date: '2024-03-15',
    total: 830000,
    status: 'completed',
    items: [
      { productId: '1', quantity: 1, price: 350000 },
      { productId: '3', quantity: 1, price: 280000 }
    ]
  },
  {
    id: '2',
    customerName: 'Trần Thị B',
    phone: '0987654321',
    date: '2024-03-14',
    total: 450000,
    status: 'pending',
    items: [
      { productId: '2', quantity: 1, price: 450000 }
    ]
  }
];

// Dữ liệu mẫu cho nhà cung cấp
export const suppliers = [
  {
    id: '1',
    name: 'Công ty TNHH Mỹ phẩm ABC',
    phone: '02412345678',
    email: 'contact@abc.com',
    address: '123 Đường ABC, Quận 1, TP.HCM'
  },
  {
    id: '2',
    name: 'Công ty TNHH Mỹ phẩm XYZ',
    phone: '02487654321',
    email: 'contact@xyz.com',
    address: '456 Đường XYZ, Quận 2, TP.HCM'
  }
];

// Dữ liệu mẫu cho người dùng
export const users = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123', // Trong thực tế sẽ mã hóa password
    fullName: 'Admin User',
    role: 'admin',
    email: 'admin@example.com'
  },
  {
    id: '2',
    username: 'staff',
    password: 'staff123',
    fullName: 'Staff User',
    role: 'staff',
    email: 'staff@example.com'
  }
]; 