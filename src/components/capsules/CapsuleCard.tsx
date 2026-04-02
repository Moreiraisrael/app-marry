"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shirt, MoreHorizontal, User } from "lucide-react"
import { motion } from "framer-motion"
import { LookCapsule } from "@/lib/actions/capsules"
import Image from "next/image"

interface CapsuleCardProps {
  capsule: LookCapsule
  index: number
}

export function CapsuleCard({ capsule, index }: CapsuleCardProps) {
  const photos = capsule.item_photos || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="border-none bg-white/70 backdrop-blur-md shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2.5rem] overflow-hidden group border border-primary/5">
        {/* Photo mosaic */}
        <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
          {photos.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center bg-stone-50">
              <Shirt className="w-12 h-12 text-stone-200" />
            </div>
          ) : photos.length === 1 ? (
            <Image
              src={photos[0]}
              alt={capsule.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-1000"
            />
          ) : (
            <div className={`grid h-full ${photos.length >= 4 ? 'grid-cols-2 grid-rows-2' : photos.length === 3 ? 'grid-cols-2' : 'grid-cols-2'} gap-0.5`}>
              {photos.slice(0, 4).map((photo, i) => (
                <div key={i} className={`relative overflow-hidden ${photos.length === 3 && i === 0 ? 'row-span-2' : ''}`}>
                  <Image
                    src={photo}
                    alt={`Peça ${i + 1}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Pills */}
          <div className="absolute top-5 left-5 opacity-0 group-hover:opacity-100 transition-all duration-500">
            {capsule.occasion && (
              <Badge className="bg-white/80 text-stone-800 text-[10px] font-bold px-3 py-1 rounded-lg backdrop-blur-md border-none shadow">
                {capsule.occasion}
              </Badge>
            )}
          </div>
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-5 right-5 h-10 w-10 rounded-xl bg-white/50 backdrop-blur-md text-foreground hover:text-primary shadow-xl border-none transition-all opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        <CardContent className="p-6">
          <h3 className="font-bold text-foreground text-lg tracking-tight mb-1 line-clamp-1 group-hover:text-primary transition-colors">
            {capsule.name}
          </h3>
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-xs text-stone-400 font-medium">
              {capsule.client_name || "Cliente"}
            </span>
            <span className="text-stone-200">·</span>
            <span className="text-xs text-stone-400">{capsule.item_ids?.length || 0} peças</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
