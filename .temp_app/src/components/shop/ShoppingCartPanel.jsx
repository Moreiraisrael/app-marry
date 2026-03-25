import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  Trash2,
  ExternalLink,
  Plus,
  Minus,
  Heart
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function ShoppingCartPanel({ clientId }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: cart } = useQuery({
    queryKey: ['shopping-cart', clientId],
    queryFn: async () => {
      if (!clientId) return null;
      const carts = await base44.entities.ShoppingCart.filter({ client_id: clientId });
      return carts[0] || null;
    },
    enabled: !!clientId
  });

  const updateCartMutation = useMutation({
    mutationFn: async (items) => {
      if (!cart) {
        return await base44.entities.ShoppingCart.create({
          client_id: clientId,
          items
        });
      }
      return await base44.entities.ShoppingCart.update(cart.id, { items });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-cart'] });
    }
  });

  const removeItem = (productId) => {
    const newItems = cart.items.filter(item => item.product_id !== productId);
    updateCartMutation.mutate(newItems);
    toast.success('Produto removido do carrinho');
  };

  const updateQuantity = (productId, delta) => {
    const newItems = cart.items.map(item => {
      if (item.product_id === productId) {
        const newQty = Math.max(1, (item.quantity || 1) + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    updateCartMutation.mutate(newItems);
  };

  const moveToWishlist = async (item) => {
    await base44.entities.WishList.create({
      client_id: clientId,
      product_id: item.product_id,
      product_name: item.product_name,
      product_image: item.product_image,
      price: item.price,
      partner_id: item.partner_id,
      partner_name: item.partner_name,
      affiliate_link: item.affiliate_link
    });
    removeItem(item.product_id);
    toast.success('Produto movido para lista de desejos');
  };

  const checkoutByPartner = async () => {
    if (!cart?.items?.length) return;

    // Group items by partner
    const itemsByPartner = cart.items.reduce((acc, item) => {
      if (!acc[item.partner_id]) {
        acc[item.partner_id] = {
          partner_name: item.partner_name,
          items: []
        };
      }
      acc[item.partner_id].items.push(item);
      return acc;
    }, {});

    // Open each partner's store in new tab
    Object.entries(itemsByPartner).forEach(([partnerId, data]) => {
      const totalItems = data.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
      toast.success(`${totalItems} produto(s) de ${data.partner_name} - abrindo loja...`);
      
      // Open first item's link (in real scenario, would be a cart link)
      setTimeout(() => {
        window.open(data.items[0].affiliate_link, '_blank');
      }, 500);
    });

    // Clear cart after checkout
    updateCartMutation.mutate([]);
    setOpen(false);
    toast.success('Carrinho limpo! Finalize suas compras nas lojas parceiras.');
  };

  const totalItems = cart?.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
  const totalPrice = cart?.items?.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0) || 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative"
        >
          <ShoppingCart className="w-5 h-5" />
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center bg-red-500">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Carrinho de Compras
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          {!cart || cart.items?.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Seu carrinho está vazio</p>
              <p className="text-sm text-gray-400 mt-2">
                Adicione produtos das ofertas exclusivas
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                <AnimatePresence>
                  {cart.items.map((item) => (
                    <motion.div
                      key={item.product_id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-2">
                          {item.product_name}
                        </h4>
                        <p className="text-xs text-gray-500">{item.partner_name}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.product_id, -1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity || 1}
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.product_id, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <span className="ml-auto font-bold text-amber-600">
                            R$ {(item.price * (item.quantity || 1)).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => moveToWishlist(item)}
                          >
                            <Heart className="w-3 h-3 mr-1" />
                            Mover
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-red-600"
                            onClick={() => removeItem(item.product_id)}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Remover
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({totalItems} itens)</span>
                  <span className="font-semibold">R$ {totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-amber-600">R$ {totalPrice.toFixed(2)}</span>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                  size="lg"
                  onClick={checkoutByPartner}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Finalizar nas Lojas Parceiras
                </Button>

                <p className="text-xs text-center text-gray-500">
                  Você será redirecionada para finalizar a compra no site de cada parceiro
                </p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}