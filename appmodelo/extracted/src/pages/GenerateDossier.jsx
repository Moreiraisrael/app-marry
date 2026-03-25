import React, { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  ArrowLeft, 
  FileText, 
  Printer,
  Download,
  Palette,
  Ruler,
  Sparkles,
  User,
  Check,
  Eye,
  Heart,
  ShoppingBag,
  Image as ImageIcon,
  Lightbulb
} from 'lucide-react';
import AIInsightsSection from '@/components/dossier/AIInsightsSection';
import MoodBoard from '@/components/dossier/MoodBoard';
import ProductRecommendations from '@/components/recommendations/ProductRecommendations';
import AIStyleProfile from '@/components/client/AIStyleProfile';
import SeasonalColorPalette from '@/components/dossier/SeasonalColorPalette';

const seasonLabels = {
  primavera_clara: 'Primavera Clara',
  primavera_quente: 'Primavera Quente',
  primavera_brilhante: 'Primavera Brilhante',
  verao_claro: 'Verão Claro',
  verao_suave: 'Verão Suave',
  verao_frio: 'Verão Frio',
  outono_suave: 'Outono Suave',
  outono_quente: 'Outono Quente',
  outono_profundo: 'Outono Profundo',
  inverno_profundo: 'Inverno Profundo',
  inverno_frio: 'Inverno Frio',
  inverno_brilhante: 'Inverno Brilhante'
};

const seasonData = {
  primavera_clara: {
    description: 'Você tem uma beleza delicada e luminosa, com características suaves e douradas. Sua energia é jovial e radiante.',
    colors: ['#FFE4C4', '#FFDAB9', '#F5DEB3', '#FFA07A', '#20B2AA', '#98FB98'],
    avoid: ['#000000', '#36454F', '#800020'],
    tips: ['Opte por cores claras e quentes', 'Use dourado em acessórios', 'Evite cores muito escuras ou frias']
  },
  primavera_quente: {
    description: 'Sua beleza irradia calor e vitalidade, com tons dourados e saturados que complementam sua energia vibrante.',
    colors: ['#FF6347', '#FF8C00', '#FFD700', '#9ACD32', '#20B2AA', '#DEB887'],
    avoid: ['#000000', '#4B0082', '#800080'],
    tips: ['Invista em tons terrosos e quentes', 'Dourado é seu melhor amigo', 'Evite roxos e pretos puros']
  },
  primavera_brilhante: {
    description: 'Você possui um alto contraste natural com cores vivas e vibrantes que refletem sua personalidade marcante.',
    colors: ['#FF1493', '#00CED1', '#FF4500', '#32CD32', '#FFD700', '#00BFFF'],
    avoid: ['#808080', '#D3D3D3', '#8B4513'],
    tips: ['Aposte em cores vibrantes e saturadas', 'Contraste é sua marca', 'Evite tons apagados e neutros']
  },
  verao_claro: {
    description: 'Sua beleza é suave e etérea, com tons delicados e acinzentados que criam uma aura de elegância.',
    colors: ['#E6E6FA', '#B0C4DE', '#DDA0DD', '#98FB98', '#F0E68C', '#FFB6C1'],
    avoid: ['#000000', '#FF4500', '#FFD700'],
    tips: ['Escolha tons suaves e rosados', 'Prata combina mais que ouro', 'Evite cores muito vibrantes']
  },
  verao_suave: {
    description: 'Você tem uma beleza elegante e sofisticada, com tons neutros e suaves que transmitem serenidade.',
    colors: ['#BC8F8F', '#C0C0C0', '#D8BFD8', '#9DC183', '#87CEEB', '#DEB887'],
    avoid: ['#000000', '#FF0000', '#FF8C00'],
    tips: ['Tons pastéis são perfeitos', 'Misture tons neutros com suavidade', 'Evite contrastes muito fortes']
  },
  verao_frio: {
    description: 'Sua beleza é refinada e fresca, com subtons rosados e azulados que conferem um ar sofisticado.',
    colors: ['#DB7093', '#6495ED', '#DDA0DD', '#778899', '#F5F5DC', '#E0B0FF'],
    avoid: ['#FF8C00', '#FFD700', '#8B4513'],
    tips: ['Aposte em tons frios e suaves', 'Prata e platina são ideais', 'Evite tons muito quentes']
  },
  outono_suave: {
    description: 'Você possui uma beleza terrosa e aconchegante, com tons amenos que refletem calor e conforto.',
    colors: ['#D2B48C', '#BC8F8F', '#8FBC8F', '#CD853F', '#F4A460', '#DAA520'],
    avoid: ['#000000', '#FF1493', '#00FFFF'],
    tips: ['Tons terrosos são perfeitos', 'Ouro rosa e bronze combinam bem', 'Evite cores muito vibrantes']
  },
  outono_quente: {
    description: 'Sua beleza é rica e vibrante, com tons intensos e dourados que transmitem energia e sofisticação.',
    colors: ['#D2691E', '#B8860B', '#6B8E23', '#CD5C5C', '#8B4513', '#FF8C00'],
    avoid: ['#000000', '#C0C0C0', '#FFB6C1'],
    tips: ['Invista em tons terrosos intensos', 'Dourado é sua cor de metal', 'Evite tons frios e prateados']
  },
  outono_profundo: {
    description: 'Você tem uma beleza marcante e intensa, com tons ricos e profundos que destacam sua presença.',
    colors: ['#8B0000', '#006400', '#4B0082', '#8B4513', '#B8860B', '#2F4F4F'],
    avoid: ['#FFB6C1', '#E6E6FA', '#FFFAF0'],
    tips: ['Cores profundas e ricas são ideais', 'Pode usar preto com moderação', 'Evite tons muito claros']
  },
  inverno_profundo: {
    description: 'Sua beleza é dramática e impactante, com alto contraste e cores intensas que fazem você brilhar.',
    colors: ['#000000', '#FFFFFF', '#FF0000', '#0000CD', '#006400', '#4B0082'],
    avoid: ['#FFE4C4', '#F5DEB3', '#DEB887'],
    tips: ['Alto contraste é seu forte', 'Preto e branco são aliados', 'Evite tons suaves e terrosos']
  },
  inverno_frio: {
    description: 'Você possui uma beleza sofisticada e elegante, com tons puros e gelados que conferem refinamento.',
    colors: ['#FF00FF', '#00FFFF', '#4169E1', '#C0C0C0', '#FFFFFF', '#800080'],
    avoid: ['#FF8C00', '#FFD700', '#8B4513'],
    tips: ['Tons puros e frios são perfeitos', 'Prata e platina combinam bem', 'Evite tons quentes']
  },
  inverno_brilhante: {
    description: 'Sua beleza é vibrante e eletrizante, com cores claras e intensas que refletem sua energia única.',
    colors: ['#FF1493', '#00FF00', '#FF0000', '#0000FF', '#FFFF00', '#FF00FF'],
    avoid: ['#808080', '#D2B48C', '#8FBC8F'],
    tips: ['Cores vibrantes e puras são ideais', 'Pode combinar cores ousadas', 'Evite tons apagados']
  }
};

const bodyTypeLabels = {
  ampulheta: 'Ampulheta',
  triangulo: 'Triângulo',
  triangulo_invertido: 'Triângulo Invertido',
  retangulo: 'Retângulo',
  oval: 'Oval'
};

const bodyTypeTips = {
  ampulheta: [
    'Valorize sua cintura com cintos e peças marcadas',
    'Vestidos ajustados funcionam muito bem',
    'Evite peças muito largas que escondam sua silhueta'
  ],
  triangulo: [
    'Valorize a parte superior com decotes e detalhes',
    'Calças retas ou levemente flare equilibram a silhueta',
    'Evite saias muito justas no quadril'
  ],
  triangulo_invertido: [
    'Valorize a parte inferior com saias e calças com volume',
    'Tops simples e sem muitos detalhes nos ombros',
    'Decotes em V ajudam a equilibrar'
  ],
  retangulo: [
    'Crie curvas com cintos e peças estruturadas',
    'Peplum e babados adicionam volume',
    'Evite peças muito retas e sem forma'
  ],
  oval: [
    'Valorize as pernas e o colo',
    'Tecidos fluidos e cortes em A são ideais',
    'Evite peças muito justas na região central'
  ]
};

const styleLabels = {
  classico: 'Clássico',
  dramatico: 'Dramático',
  romantico: 'Romântico',
  natural: 'Natural',
  criativo: 'Criativo',
  elegante: 'Elegante',
  sensual: 'Sensual'
};

const styleDescriptions = {
  classico: {
    description: 'Seu estilo é marcado pela elegância atemporal e linhas limpas. Você aprecia peças bem estruturadas e alfaiataria impecável.',
    characteristics: ['Linhas limpas e estruturadas', 'Peças atemporais', 'Alfaiataria refinada', 'Paleta neutra sofisticada'],
    wardrobe: ['Blazer bem cortado', 'Camisa branca clássica', 'Calça alfaiataria', 'Vestido tubinho', 'Trench coat'],
    moodColors: ['#1C1C1C', '#FFFFFF', '#8B7355', '#2C3E50', '#F5F5DC']
  },
  dramatico: {
    description: 'Seu estilo exala ousadia e impacto visual. Você não tem medo de chamar atenção e adora peças statement.',
    characteristics: ['Alto contraste', 'Peças statement', 'Silhuetas marcantes', 'Acessórios impactantes'],
    wardrobe: ['Casaco oversized', 'Vestido longo fluido', 'Calça de couro', 'Jaqueta estruturada', 'Botas de salto alto'],
    moodColors: ['#000000', '#FF0000', '#8B0000', '#C0C0C0', '#4B0082']
  },
  romantico: {
    description: 'Seu estilo é marcado pela delicadeza e feminilidade. Você adora detalhes suaves, rendas e tons pastéis.',
    characteristics: ['Detalhes delicados', 'Tecidos fluidos', 'Estampas florais', 'Tons suaves'],
    wardrobe: ['Vestido com babados', 'Blusa com laço', 'Saia midi fluida', 'Cardigan delicado', 'Sandália romântica'],
    moodColors: ['#FFB6C1', '#FFC0CB', '#E6E6FA', '#F0E68C', '#DDA0DD']
  },
  natural: {
    description: 'Seu estilo prioriza o conforto e autenticidade. Você prefere peças relaxadas, tecidos naturais e um visual descomplicado.',
    characteristics: ['Conforto em primeiro lugar', 'Tecidos naturais', 'Estilo relaxado', 'Tons terrosos'],
    wardrobe: ['Jeans confortável', 'Camiseta básica', 'Suéter de tricô', 'Calça linho', 'Tênis ou rasteirinha'],
    moodColors: ['#8B7355', '#D2B48C', '#6B8E23', '#F5DEB3', '#BC8F8F']
  },
  criativo: {
    description: 'Seu estilo é único e autêntico. Você adora misturar estilos, experimentar e criar looks originais.',
    characteristics: ['Mix de estilos', 'Originalidade', 'Peças únicas', 'Combinações inesperadas'],
    wardrobe: ['Peças vintage', 'Acessórios artesanais', 'Estampas diferentes', 'Sobreposições criativas', 'Peças autorais'],
    moodColors: ['#FF6347', '#4682B4', '#FFD700', '#9370DB', '#20B2AA']
  },
  elegante: {
    description: 'Seu estilo transpira sofisticação e refinamento. Você valoriza qualidade, luxo discreto e peças bem escolhidas.',
    characteristics: ['Sofisticação', 'Qualidade superior', 'Luxo discreto', 'Coordenação perfeita'],
    wardrobe: ['Vestido de seda', 'Casaco camel', 'Scarpin clássico', 'Bolsa de couro', 'Relógio elegante'],
    moodColors: ['#2C3E50', '#C9B037', '#FFFFFF', '#8B4513', '#36454F']
  },
  sensual: {
    description: 'Seu estilo valoriza as curvas e exala confiança. Você adora peças que realçam sua silhueta com glamour.',
    characteristics: ['Valorização das curvas', 'Confiança', 'Glamour', 'Peças ajustadas'],
    wardrobe: ['Vestido bodycon', 'Salto alto', 'Jeans que valorizam', 'Top com decote', 'Lingerie como roupa'],
    moodColors: ['#DC143C', '#000000', '#8B0000', '#C0C0C0', '#4B0082']
  }
};

export default function GenerateDossier() {
  const printRef = useRef(null);
  const urlParams = new URLSearchParams(window.location.search);
  const clientId = urlParams.get('clientId');
  const [consultant, setConsultant] = useState(null);
  
  const [sections, setSections] = useState({
    personalInfo: true,
    colorAnalysis: true,
    fullColorPalette: true,
    styleAnalysis: true,
    bodyType: true,
    recommendations: true,
    measures: true,
    consultationNotes: true,
    aiInsights: true,
    aiStyleProfile: true,
    moodBoard: true,
    productRecommendations: true
  });
  const [viewMode, setViewMode] = useState('web'); // 'web' or 'print'

  // Load consultant data
  React.useEffect(() => {
    const loadConsultant = async () => {
      try {
        const user = await base44.auth.me();
        setConsultant(user);
      } catch (e) {
        // Not logged in
      }
    };
    loadConsultant();
  }, []);

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      const clients = await base44.entities.Client.filter({ id: clientId });
      return clients[0];
    },
    enabled: !!clientId
  });

  const { data: colorAnalysis = [] } = useQuery({
    queryKey: ['color-analysis-dossier', clientId],
    queryFn: () => base44.entities.ColorAnalysisRequest.filter({ client_id: clientId, status: 'approved' }, '-created_date'),
    enabled: !!clientId
  });

  const { data: styleQuizzes = [] } = useQuery({
    queryKey: ['style-quizzes-dossier', clientId],
    queryFn: () => base44.entities.StyleQuiz.filter({ client_id: clientId, status: 'approved' }, '-created_date'),
    enabled: !!clientId
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments-dossier', clientId],
    queryFn: () => base44.entities.Appointment.filter({ client_id: clientId, status: 'completed' }, '-date'),
    enabled: !!clientId
  });

  const { data: wardrobeItems = [] } = useQuery({
    queryKey: ['wardrobe-dossier', clientId],
    queryFn: () => base44.entities.WardrobeItem.filter({ client_id: clientId }),
    enabled: !!clientId
  });

  const approvedColorAnalysis = colorAnalysis[0];
  const approvedStyleQuiz = styleQuizzes[0];

  const downloadDossier = async () => {
    const element = printRef.current;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Capture entire dossier
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowHeight: element.scrollHeight,
      height: element.scrollHeight
    });
    
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    // Calculate how many pages we need
    const pageHeight = (pdfWidth / imgWidth) * imgHeight;
    let heightLeft = pageHeight;
    let position = 0;
    
    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pageHeight);
    heightLeft -= pdfHeight;
    
    // Add remaining pages
    while (heightLeft > 0) {
      position = heightLeft - pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pageHeight);
      heightLeft -= pdfHeight;
    }
    
    pdf.save(`dossier-${client.full_name}.pdf`);
    
    // Unlock achievement
    try {
      const existing = await base44.entities.ClientAchievement.filter({ 
        client_id: clientId, 
        achievement_id: 'dossier_download' 
      });
      
      if (existing.length === 0) {
        await base44.entities.ClientAchievement.create({
          client_id: clientId,
          achievement_id: 'dossier_download',
          achievement_name: 'Dossiê em Mãos',
          points: 150,
          unlocked_at: new Date().toISOString()
        });
      }
    } catch (e) {
      console.error('Achievement error:', e);
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    const winPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
    
    winPrint.document.write(`
      <html>
        <head>
          <title>Dossiê - ${client?.full_name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #f4a5a5; }
            .header img { max-height: 80px; margin-bottom: 16px; }
            .header h1 { font-size: 28px; color: #333; margin-bottom: 8px; }
            .header p { color: #666; }
            .section { margin-bottom: 30px; page-break-inside: avoid; }
            .section h2 { font-size: 18px; color: #e11d48; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #fecdd3; }
            .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
            .info-item { background: #fef2f2; padding: 12px; border-radius: 8px; }
            .info-item label { font-size: 12px; color: #666; display: block; }
            .info-item span { font-weight: 600; }
            .colors { display: flex; gap: 10px; flex-wrap: wrap; margin: 16px 0; }
            .color-box { width: 50px; height: 50px; border-radius: 8px; border: 1px solid #ddd; }
            .tips { list-style: none; }
            .tips li { padding: 8px 0; padding-left: 24px; position: relative; border-bottom: 1px solid #f5f5f5; }
            .tips li:before { content: "✓"; position: absolute; left: 0; color: #e11d48; }
            .avoid-colors { opacity: 0.6; }
            .measures-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; text-align: center; }
            .measure-box { background: #f9fafb; padding: 16px; border-radius: 8px; }
            .measure-box .value { font-size: 24px; font-weight: bold; color: #e11d48; }
            .measure-box .label { font-size: 12px; color: #666; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    winPrint.document.close();
    winPrint.focus();
    setTimeout(() => {
      winPrint.print();
      winPrint.close();
    }, 250);
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto text-center py-16">
        <p className="text-gray-600">Cliente não encontrada</p>
        <Link to={createPageUrl("Clients")}>
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
      </div>
    );
  }

  const season = client.season ? seasonData[client.season] : null;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to={createPageUrl(`ClientDetail?id=${client.id}`)}>
            <Button variant="ghost" className="mb-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Perfil
            </Button>
          </Link>
          <h1 className="text-3xl font-light text-gray-900">
            Dossiê <span className="font-semibold">Personalizado</span>
          </h1>
          <p className="text-gray-600">{client.full_name}</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={viewMode === 'web' ? 'default' : 'outline'}
            onClick={() => setViewMode('web')}
          >
            <Eye className="w-4 h-4 mr-2" />
            Visualizar
          </Button>
          <Button 
            variant={viewMode === 'print' ? 'default' : 'outline'}
            onClick={() => setViewMode('print')}
          >
            <FileText className="w-4 h-4 mr-2" />
            Formato PDF
          </Button>
          <Button onClick={downloadDossier} className="bg-gradient-to-r from-rose-500 to-rose-600">
            <Download className="w-4 h-4 mr-2" />
            Baixar PDF
          </Button>
        </div>
      </div>

      {/* Section Selection */}
      <Card className="border-0 shadow-lg mb-8">
        <CardHeader>
          <CardTitle>Seções do Dossiê</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { key: 'personalInfo', label: 'Dados Pessoais', icon: User },
              { key: 'colorAnalysis', label: 'Análise de Cores', icon: Palette },
              { key: 'fullColorPalette', label: 'Cartela Completa + Maquiagem', icon: Palette },
              { key: 'styleAnalysis', label: 'Análise de Estilo', icon: Heart },
              { key: 'bodyType', label: 'Tipo de Corpo', icon: Sparkles },
              { key: 'recommendations', label: 'Recomendações', icon: ShoppingBag },
              { key: 'measures', label: 'Medidas', icon: Ruler },
              { key: 'consultationNotes', label: 'Notas de Consultoria', icon: FileText },
              { key: 'aiInsights', label: 'Insights com IA', icon: Lightbulb },
              { key: 'aiStyleProfile', label: 'Perfil de Estilo IA', icon: Sparkles },
              { key: 'moodBoard', label: 'Moodboard Visual', icon: ImageIcon },
              { key: 'productRecommendations', label: 'Produtos Recomendados', icon: ShoppingBag },
            ].map(item => (
              <div key={item.key} className="flex items-center space-x-2">
                <Checkbox
                  id={item.key}
                  checked={sections[item.key]}
                  onCheckedChange={(checked) => 
                    setSections(prev => ({ ...prev, [item.key]: checked }))
                  }
                />
                <Label htmlFor={item.key} className="flex items-center gap-2 cursor-pointer">
                  <item.icon className="w-4 h-4 text-rose-500" />
                  {item.label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <div ref={printRef}>
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>{viewMode === 'web' ? 'Dossiê Interativo' : 'Prévia para Impressão'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`bg-white rounded-lg ${viewMode === 'web' ? 'p-6' : 'p-8'}`}>
            {/* Dossier Header */}
            <div className="pdf-section header text-center mb-8 pb-4 border-b-2 border-rose-200">
              {consultant?.consultant_logo && (
                <div className="flex justify-center mb-4">
                  <img 
                    src={consultant.consultant_logo} 
                    alt="Logo" 
                    className="h-20 object-contain"
                  />
                </div>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dossiê de Imagem Pessoal</h1>
              {consultant?.consultant_business_name && (
                <p className="text-sm text-gray-500 mb-2">{consultant.consultant_business_name}</p>
              )}
              <p className="text-gray-600">{client.full_name}</p>
              <p className="text-sm text-gray-500">{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              {(consultant?.instagram || consultant?.whatsapp) && (
                <div className="flex justify-center gap-4 mt-3 text-xs text-gray-500">
                  {consultant.instagram && <span>📷 {consultant.instagram}</span>}
                  {consultant.whatsapp && <span>📱 {consultant.whatsapp}</span>}
                </div>
              )}
            </div>

            {/* Personal Info */}
            {sections.personalInfo && (
              <div className="pdf-section section mb-8">
                <h2 className="text-xl font-semibold text-rose-600 mb-4 pb-2 border-b border-rose-100">
                  Dados Pessoais
                </h2>
                <div className="info-grid grid grid-cols-2 gap-4">
                  <div className="info-item bg-rose-50 p-3 rounded-lg">
                    <label className="text-sm text-gray-500">Nome</label>
                    <span className="block font-semibold">{client.full_name}</span>
                  </div>
                  {client.email && (
                    <div className="info-item bg-rose-50 p-3 rounded-lg">
                      <label className="text-sm text-gray-500">Email</label>
                      <span className="block font-semibold">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="info-item bg-rose-50 p-3 rounded-lg">
                      <label className="text-sm text-gray-500">Telefone</label>
                      <span className="block font-semibold">{client.phone}</span>
                    </div>
                  )}
                  {client.birth_date && (
                    <div className="info-item bg-rose-50 p-3 rounded-lg">
                      <label className="text-sm text-gray-500">Data de Nascimento</label>
                      <span className="block font-semibold">
                        {new Date(client.birth_date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Color Analysis */}
            {sections.colorAnalysis && client.season && season && (
              <div className="pdf-section section mb-8">
                <h2 className="text-xl font-semibold text-rose-600 mb-4 pb-2 border-b border-rose-100">
                  Análise de Coloração: {seasonLabels[client.season]}
                </h2>
                <p className="text-gray-600 mb-4">{season.description}</p>
                
                {approvedColorAnalysis?.consultant_notes && (
                  <div className="bg-rose-50 p-4 rounded-lg mb-4">
                    <p className="text-sm font-semibold text-rose-700 mb-1">Análise da Consultora:</p>
                    <p className="text-gray-700">{approvedColorAnalysis.consultant_notes}</p>
                  </div>
                )}
                
                <h3 className="font-semibold mb-2">Paleta de Cores Ideal:</h3>
                <div className="colors flex flex-wrap gap-3 mb-6">
                  {season.colors.map((color, i) => (
                    <div key={i} className="text-center">
                      <div
                        className="color-box w-16 h-16 rounded-lg shadow-md"
                        style={{ backgroundColor: color }}
                      />
                      <p className="text-xs text-gray-500 mt-1">{color}</p>
                    </div>
                  ))}
                </div>
                
                <h3 className="font-semibold mb-2">Cores para Evitar:</h3>
                <div className="colors flex flex-wrap gap-3 opacity-60">
                  {season.avoid.map((color, i) => (
                    <div
                      key={i}
                      className="color-box w-12 h-12 rounded-lg shadow relative"
                      style={{ backgroundColor: color }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-0.5 bg-white/50 rotate-45" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full Color Palette with Makeup */}
            {sections.fullColorPalette && client.season && (
              <div className="pdf-section mb-8">
                <h2 className="text-xl font-semibold text-rose-600 mb-4 pb-2 border-b border-rose-100">
                  Cartela Completa de Cores, Maquiagem e Cabelos
                </h2>
                <SeasonalColorPalette season={client.season} />
              </div>
            )}

            {/* Style Analysis */}
            {sections.styleAnalysis && approvedStyleQuiz && (
              <div className="pdf-section section mb-8">
                <h2 className="text-xl font-semibold text-rose-600 mb-4 pb-2 border-b border-rose-100">
                  Análise de Estilo: {styleLabels[approvedStyleQuiz.consultant_style]}
                </h2>
                <p className="text-gray-600 mb-4">
                  {styleDescriptions[approvedStyleQuiz.consultant_style]?.description}
                </p>

                {approvedStyleQuiz.consultant_notes && (
                  <div className="bg-purple-50 p-4 rounded-lg mb-4">
                    <p className="text-sm font-semibold text-purple-700 mb-1">Análise da Consultora:</p>
                    <p className="text-gray-700">{approvedStyleQuiz.consultant_notes}</p>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="font-semibold mb-3">Moodboard de Estilo:</h3>
                  <div className="flex gap-2 mb-4">
                    {styleDescriptions[approvedStyleQuiz.consultant_style]?.moodColors.map((color, i) => (
                      <div
                        key={i}
                        className="w-20 h-20 rounded-lg shadow-md"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Características do Seu Estilo:</h3>
                  <ul className="space-y-1">
                    {styleDescriptions[approvedStyleQuiz.consultant_style]?.characteristics.map((char, i) => (
                      <li key={i} className="flex items-start gap-2 py-1">
                        <Check className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{char}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Peças Essenciais do Guarda-Roupa:</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {styleDescriptions[approvedStyleQuiz.consultant_style]?.wardrobe.map((item, i) => (
                      <div key={i} className="bg-gray-50 p-2 rounded text-sm text-gray-700">
                        • {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Facial Features Analysis from AI */}
            {sections.bodyType && client.facial_features && (
              <div className="pdf-section section mb-8">
                <h2 className="text-xl font-semibold text-rose-600 mb-4 pb-2 border-b border-rose-100">
                  Análise de Características Faciais
                </h2>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  {client.facial_features.face_shape && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <label className="text-sm text-purple-700 font-semibold">Formato do Rosto</label>
                      <p className="text-gray-800">{client.facial_features.face_shape}</p>
                    </div>
                  )}
                  {client.facial_features.facial_traits && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <label className="text-sm text-purple-700 font-semibold">Traços</label>
                      <p className="text-gray-800">{client.facial_features.facial_traits}</p>
                    </div>
                  )}
                  {client.facial_features.eyes_shape && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <label className="text-sm text-purple-700 font-semibold">Olhos</label>
                      <p className="text-gray-800">{client.facial_features.eyes_shape}</p>
                    </div>
                  )}
                  {client.facial_features.lips && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <label className="text-sm text-purple-700 font-semibold">Lábios</label>
                      <p className="text-gray-800">{client.facial_features.lips}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Body Analysis from AI */}
            {sections.bodyType && client.body_analysis && (
              <div className="pdf-section section mb-8">
                <h2 className="text-xl font-semibold text-rose-600 mb-4 pb-2 border-b border-rose-100">
                  Análise Corporal
                </h2>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  {client.body_analysis.bone_structure && (
                    <div className="bg-teal-50 p-3 rounded-lg">
                      <label className="text-sm text-teal-700 font-semibold">Estrutura Óssea</label>
                      <p className="text-gray-800">{client.body_analysis.bone_structure}</p>
                    </div>
                  )}
                  {client.body_analysis.shoulders && (
                    <div className="bg-teal-50 p-3 rounded-lg">
                      <label className="text-sm text-teal-700 font-semibold">Ombros</label>
                      <p className="text-gray-800">{client.body_analysis.shoulders}</p>
                    </div>
                  )}
                  {client.body_analysis.proportions && (
                    <div className="bg-teal-50 p-3 rounded-lg">
                      <label className="text-sm text-teal-700 font-semibold">Proporções</label>
                      <p className="text-gray-800">{client.body_analysis.proportions}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Style Recommendations from AI */}
            {sections.recommendations && client.style_recommendations && (
              <div className="pdf-section section mb-8">
                <h2 className="text-xl font-semibold text-rose-600 mb-4 pb-2 border-b border-rose-100">
                  Recomendações Personalizadas de Estilo
                </h2>
                <div className="space-y-3">
                  {client.style_recommendations.necklines && (
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-amber-700 mb-1">Decotes Recomendados:</p>
                      <p className="text-gray-700">{client.style_recommendations.necklines}</p>
                    </div>
                  )}
                  {client.style_recommendations.patterns && (
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-amber-700 mb-1">Estampas:</p>
                      <p className="text-gray-700">{client.style_recommendations.patterns}</p>
                    </div>
                  )}
                  {client.style_recommendations.accessories && (
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-amber-700 mb-1">Acessórios:</p>
                      <p className="text-gray-700">{client.style_recommendations.accessories}</p>
                    </div>
                  )}
                  {client.style_recommendations.hair_tips && (
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-amber-700 mb-1">Dicas de Cabelo:</p>
                      <p className="text-gray-700">{client.style_recommendations.hair_tips}</p>
                    </div>
                  )}
                  {client.style_recommendations.makeup_tips && (
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-amber-700 mb-1">Dicas de Maquiagem:</p>
                      <p className="text-gray-700">{client.style_recommendations.makeup_tips}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Body Type */}
            {sections.bodyType && client.body_type && (
              <div className="pdf-section section mb-8">
                <h2 className="text-xl font-semibold text-rose-600 mb-4 pb-2 border-b border-rose-100">
                  Tipo de Corpo: {bodyTypeLabels[client.body_type]}
                </h2>
                <ul className="tips space-y-2">
                  {bodyTypeTips[client.body_type]?.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 py-2 border-b border-gray-100">
                      <Check className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {sections.recommendations && season && (
              <div className="pdf-section section mb-8">
                <h2 className="text-xl font-semibold text-rose-600 mb-4 pb-2 border-b border-rose-100">
                  Recomendações de Estilo
                </h2>
                <ul className="tips space-y-2">
                  {season.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 py-2 border-b border-gray-100">
                      <Check className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Measures */}
            {sections.measures && (client.height || client.bust || client.waist || client.hip) && (
              <div className="pdf-section section mb-8">
                <h2 className="text-xl font-semibold text-rose-600 mb-4 pb-2 border-b border-rose-100">
                  Medidas Corporais
                </h2>
                <div className="measures-grid grid grid-cols-3 gap-4 text-center">
                  {client.height && (
                    <div className="measure-box bg-gray-50 p-4 rounded-lg">
                      <div className="value text-2xl font-bold text-rose-500">{client.height}</div>
                      <div className="label text-sm text-gray-500">Altura (cm)</div>
                    </div>
                  )}
                  {client.weight && (
                    <div className="measure-box bg-gray-50 p-4 rounded-lg">
                      <div className="value text-2xl font-bold text-rose-500">{client.weight}</div>
                      <div className="label text-sm text-gray-500">Peso (kg)</div>
                    </div>
                  )}
                  {client.bust && (
                    <div className="measure-box bg-gray-50 p-4 rounded-lg">
                      <div className="value text-2xl font-bold text-rose-500">{client.bust}</div>
                      <div className="label text-sm text-gray-500">Busto (cm)</div>
                    </div>
                  )}
                  {client.waist && (
                    <div className="measure-box bg-gray-50 p-4 rounded-lg">
                      <div className="value text-2xl font-bold text-rose-500">{client.waist}</div>
                      <div className="label text-sm text-gray-500">Cintura (cm)</div>
                    </div>
                  )}
                  {client.hip && (
                    <div className="measure-box bg-gray-50 p-4 rounded-lg">
                      <div className="value text-2xl font-bold text-rose-500">{client.hip}</div>
                      <div className="label text-sm text-gray-500">Quadril (cm)</div>
                    </div>
                  )}
                  {client.shoulder_width && (
                    <div className="measure-box bg-gray-50 p-4 rounded-lg">
                      <div className="value text-2xl font-bold text-rose-500">{client.shoulder_width}</div>
                      <div className="label text-sm text-gray-500">Ombros (cm)</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Consultation Notes */}
            {sections.consultationNotes && appointments.length > 0 && (
              <div className="pdf-section section mb-8">
                <h2 className="text-xl font-semibold text-rose-600 mb-4 pb-2 border-b border-rose-100">
                  Histórico de Consultorias
                </h2>
                <div className="space-y-3">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900">
                          {apt.service_type === 'coloracao' ? 'Análise de Coloração' :
                           apt.service_type === 'estilo' ? 'Análise de Estilo' :
                           apt.service_type === 'closet' ? 'Organização de Closet' :
                           apt.service_type === 'personal_shopping' ? 'Personal Shopping' :
                           apt.service_type === 'followup' ? 'Follow-up' : 'Consultoria'}
                        </p>
                        <span className="text-xs text-gray-500">
                          {new Date(apt.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      {apt.notes && (
                        <p className="text-sm text-gray-600">{apt.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personal Notes */}
            {client.notes && (
              <div className="pdf-section section mb-8">
                <h2 className="text-xl font-semibold text-rose-600 mb-4 pb-2 border-b border-rose-100">
                  Observações Gerais
                </h2>
                <p className="text-gray-600 whitespace-pre-wrap">{client.notes}</p>
              </div>
            )}

            {/* AI Insights Section */}
            {sections.aiInsights && (
              <div className="pdf-section section mb-8">
                <h2 className="text-xl font-semibold text-rose-600 mb-4 pb-2 border-b border-rose-100">
                  Análise Profunda com IA
                </h2>
                <AIInsightsSection
                  client={client}
                  colorAnalysis={approvedColorAnalysis}
                  styleQuiz={approvedStyleQuiz}
                  wardrobeItems={wardrobeItems}
                  appointments={appointments}
                />
              </div>
            )}
            </div>
          </CardContent>
        </Card>

        {/* AI Style Profile Section */}
        {sections.aiStyleProfile && (
          <Card className="border-0 shadow-lg mt-8">
            <CardContent className="pt-6">
              <div className="pdf-section">
                <h2 className="text-xl font-semibold text-rose-600 mb-4 pb-2 border-b border-rose-100">
                  Perfil de Estilo com IA
                </h2>
                <AIStyleProfile
                  client={client}
                  colorAnalysis={approvedColorAnalysis}
                  styleQuiz={approvedStyleQuiz}
                  wardrobeItems={wardrobeItems}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Moodboard Section */}
        {sections.moodBoard && client.season && approvedStyleQuiz && (
          <Card className="border-0 shadow-lg mt-8">
            <CardContent className="pt-6">
              <div className="pdf-section">
                <h2 className="text-xl font-semibold text-rose-600 mb-4 pb-2 border-b border-rose-100">
                  Moodboard de Estilo
                </h2>
                <MoodBoard
                  season={client.season}
                  style={approvedStyleQuiz.consultant_style}
                  clientName={client.full_name}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Product Recommendations Section */}
        {sections.productRecommendations && (client.season || approvedStyleQuiz) && (
          <Card className="border-0 shadow-lg mt-8">
            <CardContent className="pt-6">
              <div className="pdf-section">
                <h2 className="text-xl font-semibold text-rose-600 mb-4 pb-2 border-b border-rose-100">
                  Recomendações de Produtos
                </h2>
                <ProductRecommendations
                  clientId={clientId}
                  season={client.season}
                  style={approvedStyleQuiz?.consultant_style}
                  title="Produtos Selecionados para Seu Perfil"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}