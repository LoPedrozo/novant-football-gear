import mercurialVapor from '@/assets/products/mercurial-vapor.jpg';
import predatorEdge from '@/assets/products/predator-edge.jpg';
import futureUltimate from '@/assets/products/future-ultimate.jpg';
import furonV7 from '@/assets/products/furon-v7.jpg';

import reactGato from '@/assets/products/react-gato.jpg';
import topSala from '@/assets/products/top-sala.jpg';
import futurePlay from '@/assets/products/future-play.jpg';
import copaPure from '@/assets/products/copa-pure.jpg';
import caneleiraMercurial from '@/assets/products/caneleira-mercurial.jpg';
import meiaPerformance from '@/assets/products/meia-performance.jpg';
import phantomLuna from '@/assets/products/phantom-luna.jpg';

import catCampo from '@/assets/categories/campo.jpg';
import catFutsal from '@/assets/categories/futsal.jpg';
import catSociety from '@/assets/categories/society.jpg';
import catAcessorios from '@/assets/categories/acessorios.jpg';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price: number | null;
  brand: string;
  category: 'campo' | 'futsal' | 'society' | 'acessorios';
  image_url: string;
  rating: number;
  reviews_count: number;
  sizes: string[];
  colors: string[];
  in_stock: boolean;
  featured: boolean;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Mercurial Vapor 16 Elite',
    description: 'Chuteira de campo profissional com tecnologia Flyknit',
    price: 1299.90,
    original_price: 1599.90,
    brand: 'Nike',
    category: 'campo',
    image_url: mercurialVapor,
    rating: 4.8,
    reviews_count: 234,
    sizes: ['38', '39', '40', '41', '42', '43'],
    colors: ['Preto', 'Branco', 'Verde'],
    in_stock: true,
    featured: true,
  },
  {
    id: '2',
    name: 'Predator Edge.1 FG',
    description: 'Chuteira de campo com Zone Skin para controle supremo',
    price: 1199.90,
    original_price: null,
    brand: 'Adidas',
    category: 'campo',
    image_url: predatorEdge,
    rating: 4.7,
    reviews_count: 189,
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    colors: ['Vermelho', 'Preto'],
    in_stock: true,
    featured: true,
  },
  {
    id: '3',
    name: 'Future Ultimate FG',
    description: 'Chuteira de campo leve com FUZIONFIT+',
    price: 999.90,
    original_price: 1199.90,
    brand: 'Puma',
    category: 'campo',
    image_url: futureUltimate,
    rating: 4.5,
    reviews_count: 156,
    sizes: ['39', '40', '41', '42', '43'],
    colors: ['Azul', 'Amarelo'],
    in_stock: true,
    featured: true,
  },
  {
    id: '4',
    name: 'Furon v7+ Pro',
    description: 'Chuteira de campo para velocidade máxima',
    price: 899.90,
    original_price: null,
    brand: 'New Balance',
    category: 'campo',
    image_url: furonV7,
    rating: 4.4,
    reviews_count: 98,
    sizes: ['38', '39', '40', '41', '42'],
    colors: ['Branco', 'Preto'],
    in_stock: true,
    featured: false,
  },
  {
    id: '6',
    name: 'React Gato IC',
    description: 'Chuteira de futsal com amortecimento React',
    price: 699.90,
    original_price: null,
    brand: 'Nike',
    category: 'futsal',
    image_url: reactGato,
    rating: 4.6,
    reviews_count: 312,
    sizes: ['38', '39', '40', '41', '42', '43'],
    colors: ['Branco', 'Vermelho'],
    in_stock: true,
    featured: true,
  },
  {
    id: '7',
    name: 'Top Sala IC',
    description: 'Chuteira de futsal profissional com sola especial',
    price: 599.90,
    original_price: 749.90,
    brand: 'Adidas',
    category: 'futsal',
    image_url: topSala,
    rating: 4.5,
    reviews_count: 201,
    sizes: ['38', '39', '40', '41', '42'],
    colors: ['Preto', 'Dourado'],
    in_stock: true,
    featured: false,
  },
  {
    id: '8',
    name: 'Future Play TT',
    description: 'Chuteira society com solado para grama sintética',
    price: 449.90,
    original_price: null,
    brand: 'Puma',
    category: 'society',
    image_url: futurePlay,
    rating: 4.3,
    reviews_count: 145,
    sizes: ['39', '40', '41', '42', '43'],
    colors: ['Verde', 'Preto'],
    in_stock: true,
    featured: false,
  },
  {
    id: '9',
    name: 'Copa Pure II TF',
    description: 'Chuteira society com couro premium',
    price: 549.90,
    original_price: 699.90,
    brand: 'Adidas',
    category: 'society',
    image_url: copaPure,
    rating: 4.6,
    reviews_count: 178,
    sizes: ['38', '39', '40', '41', '42', '43'],
    colors: ['Marrom', 'Branco'],
    in_stock: true,
    featured: true,
  },
  {
    id: '10',
    name: 'Caneleira Mercurial Lite',
    description: 'Caneleira leve com espuma de proteção',
    price: 149.90,
    original_price: null,
    brand: 'Nike',
    category: 'acessorios',
    image_url: caneleiraMercurial,
    rating: 4.4,
    reviews_count: 89,
    sizes: ['P', 'M', 'G'],
    colors: ['Preto', 'Branco'],
    in_stock: true,
    featured: false,
  },
  {
    id: '11',
    name: 'Meia Performance Pro',
    description: 'Meias de compressão para alto desempenho',
    price: 79.90,
    original_price: 99.90,
    brand: 'Adidas',
    category: 'acessorios',
    image_url: meiaPerformance,
    rating: 4.2,
    reviews_count: 56,
    sizes: ['P', 'M', 'G', 'GG'],
    colors: ['Preto', 'Branco', 'Azul'],
    in_stock: true,
    featured: false,
  },
  {
    id: '12',
    name: 'Phantom Luna II Elite FG',
    description: 'Chuteira de campo feminina com ajuste anatômico',
    price: 1099.90,
    original_price: 1399.90,
    brand: 'Nike',
    category: 'campo',
    image_url: phantomLuna,
    rating: 4.9,
    reviews_count: 267,
    sizes: ['35', '36', '37', '38', '39', '40'],
    colors: ['Rosa', 'Branco'],
    in_stock: true,
    featured: true,
  },
];

export const categories = [
  { name: 'Chuteiras Campo', slug: 'campo', image: catCampo },
  { name: 'Chuteiras Futsal', slug: 'futsal', image: catFutsal },
  { name: 'Chuteiras Society', slug: 'society', image: catSociety },
  { name: 'Acessórios', slug: 'acessorios', image: catAcessorios },
];

export const brands = ['Nike', 'Adidas', 'Puma', 'New Balance'];
