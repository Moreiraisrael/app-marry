import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Loader2 } from 'lucide-react';

const seasons = [
  { value: 'primavera_clara', label: 'Primavera Clara' },
  { value: 'primavera_quente', label: 'Primavera Quente' },
  { value: 'primavera_brilhante', label: 'Primavera Brilhante' },
  { value: 'verao_claro', label: 'Verão Claro' },
  { value: 'verao_suave', label: 'Verão Suave' },
  { value: 'verao_frio', label: 'Verão Frio' },
  { value: 'outono_suave', label: 'Outono Suave' },
  { value: 'outono_quente', label: 'Outono Quente' },
  { value: 'outono_profundo', label: 'Outono Profundo' },
  { value: 'inverno_profundo', label: 'Inverno Profundo' },
  { value: 'inverno_frio', label: 'Inverno Frio' },
  { value: 'inverno_brilhante', label: 'Inverno Brilhante' },
];

const bodyTypes = [
  { value: 'ampulheta', label: 'Ampulheta' },
  { value: 'triangulo', label: 'Triângulo' },
  { value: 'triangulo_invertido', label: 'Triângulo Invertido' },
  { value: 'retangulo', label: 'Retângulo' },
  { value: 'oval', label: 'Oval' },
];

export default function ClientForm({ client, onClose }) {
  const [formData, setFormData] = useState({
    full_name: client?.full_name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    birth_date: client?.birth_date || '',
    profile_photo: client?.profile_photo || '',
    height: client?.height || '',
    weight: client?.weight || '',
    bust: client?.bust || '',
    waist: client?.waist || '',
    hip: client?.hip || '',
    shoulder_width: client?.shoulder_width || '',
    body_type: client?.body_type || '',
    skin_tone: client?.skin_tone || '',
    hair_color: client?.hair_color || '',
    eye_color: client?.eye_color || '',
    season: client?.season || '',
    notes: client?.notes || '',
  });
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => {
      if (client?.id) {
        return base44.entities.Client.update(client.id, data);
      }
      return base44.entities.Client.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      onClose();
    }
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, profile_photo: file_url }));
    } catch (error) {
      console.error('Upload error:', error);
    }
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      height: formData.height ? Number(formData.height) : null,
      weight: formData.weight ? Number(formData.weight) : null,
      bust: formData.bust ? Number(formData.bust) : null,
      waist: formData.waist ? Number(formData.waist) : null,
      hip: formData.hip ? Number(formData.hip) : null,
      shoulder_width: formData.shoulder_width ? Number(formData.shoulder_width) : null,
    };
    mutation.mutate(dataToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
          <TabsTrigger value="measures">Medidas</TabsTrigger>
          <TabsTrigger value="analysis">Análise</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4 mt-4">
          {/* Photo Upload */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {formData.profile_photo ? (
                <img 
                  src={formData.profile_photo} 
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
              {uploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium">Foto de Perfil</p>
              <p className="text-xs text-gray-500">Clique para fazer upload</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Nome Completo *</Label>
              <Input
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                required
              />
            </div>
            <div className="col-span-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
            <div>
              <Label>Data de Nascimento</Label>
              <Input
                type="date"
                value={formData.birth_date}
                onChange={(e) => handleChange('birth_date', e.target.value)}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="measures" className="space-y-4 mt-4">
          <p className="text-sm text-gray-600 mb-4">
            As medidas são importantes para o provador virtual criar o clone da cliente.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Altura (cm)</Label>
              <Input
                type="number"
                value={formData.height}
                onChange={(e) => handleChange('height', e.target.value)}
                placeholder="165"
              />
            </div>
            <div>
              <Label>Peso (kg)</Label>
              <Input
                type="number"
                value={formData.weight}
                onChange={(e) => handleChange('weight', e.target.value)}
                placeholder="60"
              />
            </div>
            <div>
              <Label>Busto (cm)</Label>
              <Input
                type="number"
                value={formData.bust}
                onChange={(e) => handleChange('bust', e.target.value)}
                placeholder="90"
              />
            </div>
            <div>
              <Label>Cintura (cm)</Label>
              <Input
                type="number"
                value={formData.waist}
                onChange={(e) => handleChange('waist', e.target.value)}
                placeholder="70"
              />
            </div>
            <div>
              <Label>Quadril (cm)</Label>
              <Input
                type="number"
                value={formData.hip}
                onChange={(e) => handleChange('hip', e.target.value)}
                placeholder="95"
              />
            </div>
            <div>
              <Label>Ombros (cm)</Label>
              <Input
                type="number"
                value={formData.shoulder_width}
                onChange={(e) => handleChange('shoulder_width', e.target.value)}
                placeholder="40"
              />
            </div>
          </div>
          
          <div>
            <Label>Tipo de Corpo</Label>
            <Select
              value={formData.body_type}
              onValueChange={(value) => handleChange('body_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {bodyTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
        
        <TabsContent value="analysis" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tom de Pele</Label>
              <Input
                value={formData.skin_tone}
                onChange={(e) => handleChange('skin_tone', e.target.value)}
                placeholder="Ex: Claro com subtom rosado"
              />
            </div>
            <div>
              <Label>Cor dos Cabelos</Label>
              <Input
                value={formData.hair_color}
                onChange={(e) => handleChange('hair_color', e.target.value)}
                placeholder="Ex: Castanho escuro"
              />
            </div>
            <div>
              <Label>Cor dos Olhos</Label>
              <Input
                value={formData.eye_color}
                onChange={(e) => handleChange('eye_color', e.target.value)}
                placeholder="Ex: Castanho mel"
              />
            </div>
            <div>
              <Label>Estação</Label>
              <Select
                value={formData.season}
                onValueChange={(value) => handleChange('season', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a estação" />
                </SelectTrigger>
                <SelectContent>
                  {seasons.map(season => (
                    <SelectItem key={season.value} value={season.value}>
                      {season.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label>Observações</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Anotações sobre a cliente..."
              rows={4}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancelar
        </Button>
        <Button 
          type="submit" 
          className="flex-1 bg-gradient-to-r from-rose-500 to-rose-600"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : null}
          {client?.id ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </div>
    </form>
  );
}