import { createClient } from "@/lib/supabase/server"
import { getLookCapsules, LookCapsule } from "@/lib/actions/capsules"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Shirt } from "lucide-react"
import Image from "next/image"

export const dynamic = 'force-dynamic'

function LookCard({ capsule, index }: { capsule: LookCapsule; index: number }) {
  const photos = capsule.item_photos || []

  const delayClass = index === 0 ? 'delay-0' : index === 1 ? 'delay-75' : index === 2 ? 'delay-100' : index === 3 ? 'delay-150' : 'delay-200'

  return (
    <div
      className={`group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-rose-50 animate-in fade-in ${delayClass}`}
    >
      {/* Photo mosaic */}
      <div className="relative aspect-[4/5] overflow-hidden bg-rose-50">
        {photos.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            <Shirt className="w-12 h-12 text-rose-200" />
          </div>
        ) : photos.length === 1 ? (
          <Image
            src={photos[0]}
            alt={capsule.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className={`grid h-full gap-0.5 ${photos.length >= 4 ? 'grid-cols-2 grid-rows-2' : 'grid-cols-2'}`}>
            {photos.slice(0, 4).map((photo, i) => (
              <div key={i} className={`relative overflow-hidden ${photos.length === 3 && i === 0 ? 'row-span-2' : ''}`}>
                <Image
                  src={photo}
                  alt={`Peça ${i + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            ))}
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {capsule.occasion && (
          <div className="absolute bottom-4 left-4">
            <Badge className="bg-white/90 text-stone-700 text-[10px] font-bold px-3 py-1 rounded-lg shadow backdrop-blur-sm border-none">
              {capsule.occasion}
            </Badge>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-6">
        <h3 className="font-bold text-stone-900 text-lg leading-tight mb-1">{capsule.name}</h3>
        <p className="text-xs text-stone-400 font-medium">{capsule.item_ids?.length || 0} peças combinadas</p>

        {capsule.description && (
          <p className="text-sm text-stone-500 mt-3 leading-relaxed line-clamp-2 italic">
            {capsule.description}
          </p>
        )}
      </div>
    </div>
  )
}

export default async function ClientLooksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Check if current user is a consultant — if so, show their clients' combined looks
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type, consultant_id')
    .eq('id', user.id)
    .single()

  let looks: LookCapsule[] = []

  if (profile?.user_type === 'consultant') {
    // Consultant previewing: fetch all looks for their clients
    const { data: clientProfiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('consultant_id', user.id)

    if (clientProfiles && clientProfiles.length > 0) {
      const clientIds = clientProfiles.map(c => c.id)
      const { data: rawLooks, error } = await supabase
        .from('look_capsules')
        .select('*')
        .in('client_id', clientIds)
        .order('created_at', { ascending: false })

      if (!error && rawLooks) {
        looks = await Promise.all(rawLooks.map(async (capsule) => {
          let item_photos: string[] = []
          if (capsule.item_ids && capsule.item_ids.length > 0) {
            const { data: items } = await supabase
              .from('wardrobe_items')
              .select('photo_url')
              .in('id', capsule.item_ids)
              .limit(4)
            item_photos = (items || []).map((i: { photo_url: string }) => i.photo_url)
          }
          return { ...capsule, item_photos }
        }))
      }
    }
  } else {
    // Regular client: fetch own looks
    looks = await getLookCapsules(user.id)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header */}
      <div className="text-center space-y-4 pt-4">
        <Badge className="bg-rose-100 text-rose-600 border-rose-200 px-4 py-1 rounded-full uppercase tracking-widest text-[10px] font-bold">
          Curadoria Exclusiva
        </Badge>
        <h1 className="text-5xl font-serif font-bold text-neutral-900 tracking-tight">
          Meus Looks
        </h1>
        <p className="text-neutral-500 text-lg max-w-xl mx-auto">
          Combinações montadas estrategicamente pela sua consultora com base no seu estilo e DNA de cores.
        </p>
      </div>

      {looks.length === 0 ? (
        <div className="py-24 text-center space-y-6 bg-rose-50/50 rounded-[3rem] border border-dashed border-rose-200">
          <div className="w-24 h-24 rounded-[2rem] bg-white mx-auto flex items-center justify-center shadow-sm border border-rose-100">
            <Sparkles className="w-10 h-10 text-rose-300" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-serif font-bold text-neutral-900">Looks a caminho...</h3>
            <p className="text-stone-500 max-w-sm mx-auto">
              Sua consultora está montando combinações exclusivas para você. Em breve elas aparecerão aqui ✨
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {looks.map((look, i) => (
            <LookCard key={look.id} capsule={look} index={i} />
          ))}
        </div>
      )}

      {/* Footer branding */}
      <div className="text-center pb-12 opacity-50 flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-rose-400" />
        <span className="text-neutral-400 text-xs tracking-[0.3em] font-medium uppercase">Montado por Marry Miele · E.S.T.I.L.O.</span>
      </div>
    </div>
  )
}
