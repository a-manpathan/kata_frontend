// frontend/src/types/index.ts
export interface User {
    id: string;
    email: string;
    role: 'user' | 'admin';
  }
  
  export interface Sweet {
    id: string;
    name: string;
    category: string;
    price: string;
    quantity: number;
  }
  
  export interface AuthResponse {
    token: string;
    user: User;
  }