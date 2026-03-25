import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload, Save, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [businessName, setBusinessName] = useState('');
  const [instagram, setInstagram] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        setBusinessName(userData.consultant_business_name || '');
        setInstagram(userData.instagram || '');
        setWhatsapp(userData.whatsapp || '');
      } catch (e) {
        console.error(e);
      }
    };
    loadUser();
  }, []);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploaded = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ consultant_logo: uploaded.file_url });
      setUser({ ...user, consultant_logo: uploaded.file_url });
      toast.success('Logo atualizado!');
    } catch (error) {
      toast.error('Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        consultant_business_name: businessName,
        instagram,
        whatsapp
      });
      toast.success('Configurações salvas!');
    } catch (error) {
      toast.error('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto bg-neutral-950 min-h-screen">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-400 text-sm font-medium mb-4 border border-amber-500/20">
          <Sparkles className="w-4 h-4" />
          Personalização
        </div>
        <h1 className="text-3xl font-light text-neutral-100">
          <span className="font-bold bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-transparent">Configurações</span> do Dossiê
        </h1>
        <p className="text-neutral-400 mt-2">
          Personalize seus dossiês e relatórios com sua identidade visual
        </p>
      </div>

      <div className="space-y-6">
        {/* Logo Upload */}
        <Card className="border border-amber-500/20 shadow-2xl bg-black">
          <CardHeader>
            <CardTitle className="text-neutral-100">Logotipo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.consultant_logo && (
              <div className="flex justify-center p-6 bg-neutral-900 border border-neutral-800 rounded-lg">
                <img 
                  src={user.consultant_logo} 
                  alt="Logo" 
                  className="max-h-32 object-contain"
                />
              </div>
            )}
            
            <div>
              <Input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
                disabled={uploading}
              />
              <label htmlFor="logo-upload">
                <Button
                  asChild
                  variant="outline"
                  className="w-full cursor-pointer bg-neutral-900 border-neutral-700 text-neutral-200 hover:bg-neutral-800 hover:border-amber-500/50"
                  disabled={uploading}
                >
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? 'Fazendo upload...' : user.consultant_logo ? 'Alterar Logo' : 'Fazer Upload do Logo'}
                  </span>
                </Button>
              </label>
              <p className="text-xs text-neutral-500 mt-2">
                Recomendado: PNG ou SVG transparente, máx. 500x200px
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card className="border border-amber-500/20 shadow-2xl bg-black">
          <CardHeader>
            <CardTitle className="text-neutral-100">Informações de Contato</CardTitle>
            <p className="text-sm text-neutral-400 mt-2">
              Essas informações aparecerão nos dossiês e relatórios enviados às clientes
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="business-name" className="text-neutral-200">Nome do Negócio / Consultora</Label>
              <Input
                id="business-name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Ex: Studio Estilo & Imagem ou Maria Silva Consultoria"
                className="bg-neutral-900 border-neutral-700 text-neutral-200 placeholder:text-neutral-600 mt-2"
              />
            </div>

            <div>
              <Label htmlFor="instagram" className="text-neutral-200">Instagram</Label>
              <Input
                id="instagram"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@seuinstagram"
                className="bg-neutral-900 border-neutral-700 text-neutral-200 placeholder:text-neutral-600 mt-2"
              />
            </div>

            <div>
              <Label htmlFor="whatsapp" className="text-neutral-200">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="(11) 99999-9999"
                className="bg-neutral-900 border-neutral-700 text-neutral-200 placeholder:text-neutral-600 mt-2"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 shadow-lg shadow-amber-500/20 mt-6"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="border border-amber-500/20 shadow-2xl bg-black">
          <CardHeader>
            <CardTitle className="text-neutral-100">Prévia do Cabeçalho do Dossiê</CardTitle>
            <p className="text-sm text-neutral-400 mt-2">
              Veja como suas informações aparecerão nos relatórios e dossiês
            </p>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-amber-500/30 rounded-lg p-8 bg-gradient-to-br from-neutral-950 via-neutral-900 to-black">
              <div className="text-center">
                {user.consultant_logo && (
                  <div className="flex justify-center mb-6">
                    <img 
                      src={user.consultant_logo} 
                      alt="Logo" 
                      className="h-20 object-contain"
                    />
                  </div>
                )}
                <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-red-400 bg-clip-text text-transparent mb-3">
                  Dossiê de Imagem Pessoal
                </h1>
                {businessName && (
                  <p className="text-sm text-neutral-400 mb-3 font-medium">{businessName}</p>
                )}
                <div className="h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent my-4" />
                <p className="text-neutral-200 mb-1 font-semibold">Nome da Cliente</p>
                <p className="text-sm text-neutral-500">
                  {new Date().toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
                {(instagram || whatsapp) && (
                  <div className="flex justify-center gap-6 mt-6 text-xs text-neutral-400 border-t border-neutral-800 pt-4">
                    {instagram && <span className="flex items-center gap-1">📷 {instagram}</span>}
                    {whatsapp && <span className="flex items-center gap-1">📱 {whatsapp}</span>}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}