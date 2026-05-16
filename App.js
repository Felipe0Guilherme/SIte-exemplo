
/**
 * Site Camaleão — App de Cadastro com Fotos
 * 
 * INSTALAÇÃO:
 *   npx expo install firebase expo-image-picker
 * 
 * IMGBB (hospedagem de fotos GRATUITA):
 *   1. Acesse https://imgbb.com → crie conta grátis
 *   2. Vá em https://api.imgbb.com → copie sua API Key
 *   3. Cole na variável IMGBB_KEY abaixo
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, Platform,
  StatusBar, SafeAreaView, KeyboardAvoidingView, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, push, set } from 'firebase/database';

// ─── CONFIGURAÇÕES ────────────────────────────────────────────────
const FIREBASE_CONFIG = {
  apiKey:            'AIzaSyDR2GR6eb294KoBuLpPn6T_mjO50d8aGgo',
  authDomain:        'siteexemplo-31f99.firebaseapp.com',
  databaseURL:       'https://siteexemplo-31f99-default-rtdb.firebaseio.com',
  projectId:         'siteexemplo-31f99',
  storageBucket:     'siteexemplo-31f99.firebasestorage.app',
  messagingSenderId: '690569274541',
  appId:             '1:690569274541:web:f0bf16fb0ab7e34baa5224',
};

// ⚠️ Crie sua chave GRÁTIS em: https://api.imgbb.com
const IMGBB_KEY = '287d2ffe21cefefe43ddbbafb8c1730e';

const fbApp = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApps()[0];
const DB    = getDatabase(fbApp);

// ─── NICHOS ───────────────────────────────────────────────────────
const NICHES = [
  { key: 'car',        label: 'Concessionária', icon: '🚗', color: '#f5c518', bg: '#0e0d08' },
  { key: 'dental',     label: 'Odontologia',    icon: '🦷', color: '#00c9e0', bg: '#02181e' },
  { key: 'market',     label: 'Supermercado',   icon: '🛒', color: '#f4800a', bg: '#0d0900' },
  { key: 'gym',        label: 'Academia',        icon: '💪', color: '#ff3d3d', bg: '#070507' },
  { key: 'law',        label: 'Advocacia',       icon: '⚖️', color: '#c9a440', bg: '#080600' },
  { key: 'pet',        label: 'Pet Shop',        icon: '🐾', color: '#ff6b9d', bg: '#1a0a1e' },
  { key: 'realty',     label: 'Imobiliária',     icon: '🏡', color: '#60a5fa', bg: '#020810' },
  { key: 'restaurant', label: 'Restaurante',     icon: '🍽️', color: '#c8753a', bg: '#0b0500' },
  { key: 'beauty',     label: 'Estética',        icon: '✨', color: '#c4a882', bg: '#2a1f16' },
  { key: 'tech',       label: 'Software',        icon: '💻', color: '#00ff88', bg: '#010a04' },
];

// ─── FORMULÁRIOS ──────────────────────────────────────────────────
// type: 'text' | 'number' | 'decimal' | 'select' | 'photo'
const FORMS = {
  car: {
    path: 'car/items', title: 'Novo Veículo',
    fields: [
      { key:'img',  label:'Foto do Veículo',   type:'photo' },
      { key:'m',    label:'Modelo',             placeholder:'BMW M4 Competition',  type:'text'   },
      { key:'y',    label:'Ano',                placeholder:'2024',                 type:'number' },
      { key:'cat',  label:'Categoria',          type:'select',
        options: ['Esportivo','SUV','Gran Turismo','Super','Wagon','Sedan'] },
      { key:'km',   label:'Quilometragem',      placeholder:'0 km',                 type:'text'   },
      { key:'p',    label:'Preço',              placeholder:'R$ 895.000',           type:'text'   },
      { key:'tag',  label:'Condição',           type:'select', options: ['NOVO','SEMI','PREMIUM'] },
      { key:'cor',  label:'Cor',                placeholder:'Preto',                type:'text'   },
      { key:'emoji',label:'Emoji (fallback)',   placeholder:'🚗',                   type:'text'   },
    ],
    defaults: { tc:'#000', tb:'#f5c518' },
  },
  dental: {
    path: 'dental/services', title: 'Novo Serviço Dental',
    fields: [
      { key:'img', label:'Foto do Procedimento', type:'photo' },
      { key:'ic',  label:'Emoji (fallback)',      placeholder:'🦷',                  type:'text' },
      { key:'n',   label:'Serviço',              placeholder:'Clareamento a Laser',  type:'text' },
      { key:'d',   label:'Descrição',            placeholder:'Resultado em 1 sessão',type:'text' },
      { key:'p',   label:'Preço',                placeholder:'R$ 450',              type:'text' },
    ],
    defaults: {},
  },
  market: {
    path: 'market/items', title: 'Novo Produto',
    fields: [
      { key:'img',  label:'Foto do Produto',       type:'photo' },
      { key:'n',    label:'Nome',                  placeholder:'Picanha Friboi',     type:'text'    },
      { key:'e',    label:'Emoji (fallback)',       placeholder:'🥩',                 type:'text'    },
      { key:'u',    label:'Unidade',               placeholder:'kg',                 type:'text'    },
      { key:'p',    label:'Preço (R$)',             placeholder:'89.90',               type:'decimal' },
      { key:'old',  label:'Preço Antigo (opcional)',placeholder:'99.90',              type:'decimal' },
      { key:'seal', label:'Desconto (ex: 18%)',    placeholder:'18%',                type:'text'    },
      { key:'cat',  label:'Categoria',             type:'select',
        options: ['Carnes','Hortifruti','Laticínios','Bebidas','Grãos','Limpeza','Padaria'] },
    ],
    defaults: {},
  },
  gym: {
    path: 'gym/schedule', title: 'Novo Horário na Grade',
    fields: [
      { key:'t', label:'Horário',                       placeholder:'18:00',                type:'text' },
      { key:'s', label:'Aulas (separadas por vírgula)', placeholder:'Musculação,HIIT,Yoga', type:'text' },
    ],
    defaults: {},
    transform: (data) => ({ ...data, s: data.s.split(',').map(x => x.trim()) }),
  },
  law: {
    path: 'law/areas', title: 'Nova Área Jurídica',
    fields: [
      { key:'n',  label:'Número Romano', placeholder:'VII',                  type:'text' },
      { key:'ic', label:'Emoji',         placeholder:'⚖️',                   type:'text' },
      { key:'t',  label:'Área',          placeholder:'Direito Digital',       type:'text' },
      { key:'s',  label:'Subtítulo',     placeholder:'LGPD, crimes digitais', type:'text' },
    ],
    defaults: {},
  },
  pet: {
    path: 'pet/services', title: 'Novo Serviço Pet',
    fields: [
      { key:'img', label:'Foto do Serviço',  type:'photo' },
      { key:'n',   label:'Serviço',          placeholder:'Banho & Tosa',                   type:'text' },
      { key:'e',   label:'Emoji (fallback)', placeholder:'🛁',                              type:'text' },
      { key:'d',   label:'Descrição',        placeholder:'Hidratação premium e corte',      type:'text' },
      { key:'p',   label:'Preço',            placeholder:'A partir R$ 60',                  type:'text' },
      { key:'c',   label:'Cor (hex)',        placeholder:'#ff6b9d',                         type:'text' },
      { key:'dur', label:'Duração',          placeholder:'1-2h',                            type:'text' },
    ],
    defaults: {},
  },
  realty: {
    path: 'realty/items', title: 'Novo Imóvel',
    fields: [
      { key:'img',    label:'Foto do Imóvel',  type:'photo' },
      { key:'t',      label:'Título',          placeholder:'Apartamento Alto Padrão', type:'text'   },
      { key:'e',      label:'Emoji (fallback)',placeholder:'🏢',                      type:'text'   },
      { key:'l',      label:'Localização',     placeholder:'Moema, SP',               type:'text'   },
      { key:'type',   label:'Tipo',            type:'select', options: ['VENDA','ALUGUEL'] },
      { key:'rooms',  label:'Quartos',         placeholder:'3',                       type:'number' },
      { key:'area',   label:'Área m²',         placeholder:'120',                     type:'number' },
      { key:'garage', label:'Vagas',           placeholder:'2',                       type:'number' },
      { key:'p',      label:'Preço',           placeholder:'R$ 1.850.000',            type:'text'   },
    ],
    defaults: { typeBg:'#1e3a5f', bg:'#dbeafe' },
  },
  restaurant: {
    path: 'restaurant/menu', title: 'Novo Item do Cardápio',
    fields: [
      { key:'img',       label:'Foto do Prato',    type:'photo' },
      { key:'_categoria',label:'Categoria',        type:'select',
        options: ['Entradas','Pratos','Bebidas','Sobremesas'] },
      { key:'e',         label:'Emoji (fallback)', placeholder:'🥩',                             type:'text' },
      { key:'n',         label:'Nome do Prato',    placeholder:'Picanha na Brasa 400g',          type:'text' },
      { key:'d',         label:'Descrição',        placeholder:'Maturada 30 dias, arroz arbóreo',type:'text' },
      { key:'p',         label:'Preço',            placeholder:'R$ 98',                          type:'text' },
      { key:'tags',      label:'Tags (vírgula)',   placeholder:'Mais Pedido,Sem Glúten',         type:'text' },
    ],
    defaults: {},
    dynamicPath: (data) => `restaurant/menu/${data._categoria}`,
    transform: (data) => {
      const { _categoria, tags, ...rest } = data;
      return { ...rest, tags: tags ? tags.split(',').map(t => t.trim()) : [] };
    },
  },
  beauty: {
    path: 'beauty/items', title: 'Novo Procedimento',
    fields: [
      { key:'imgBefore', label:'Foto ANTES',        type:'photo' },
      { key:'imgAfter',  label:'Foto DEPOIS',       type:'photo' },
      { key:'n',         label:'Procedimento',      placeholder:'Microblading',               type:'text'   },
      { key:'d',         label:'Descrição',         placeholder:'Design fio a fio. Natural.', type:'text'   },
      { key:'before',    label:'Emoji antes (fallback)', placeholder:'😐',                   type:'text'   },
      { key:'after',     label:'Emoji depois (fallback)',placeholder:'😍',                   type:'text'   },
      { key:'p',         label:'Preço',             placeholder:'R$ 650',                     type:'text'   },
      { key:'dur',       label:'Duração',           placeholder:'2h30',                       type:'text'   },
      { key:'cat',       label:'Categoria',         type:'select', options: ['Rosto','Pele','Corpo'] },
    ],
    defaults: {},
  },
  tech: {
    path: 'tech/repos', title: 'Novo Repositório',
    fields: [
      { key:'n',  label:'Nome do Repo', placeholder:'meu-projeto-sdk',         type:'text'   },
      { key:'d',  label:'Descrição',    placeholder:'SDK TypeScript para PIX.', type:'text'   },
      { key:'l',  label:'Linguagem',    placeholder:'TypeScript',               type:'text'   },
      { key:'lc', label:'Cor (hex)',    placeholder:'#3178c6',                  type:'text'   },
      { key:'s',  label:'Stars ★',      placeholder:'100',                      type:'number' },
      { key:'f',  label:'Forks ⑂',      placeholder:'20',                       type:'number' },
    ],
    defaults: {},
  },
};

// ─── UPLOAD IMGBB ─────────────────────────────────────────────────
async function uploadToImgBB(base64) {
  const body = new FormData();
  body.append('key', IMGBB_KEY);
  body.append('image', base64);
  const res  = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Erro no upload');
  return json.data.url;
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────
export default function App() {
  const [selectedNiche, setSelectedNiche] = useState('car');
  const [formData,      setFormData]      = useState({});
  const [loading,       setLoading]       = useState(false);
  const [uploading,     setUploading]     = useState(false);
  const [uploadingKey,  setUploadingKey]  = useState(null);
  const [lastAdded,     setLastAdded]     = useState(null);

  const niche      = NICHES.find(n => n.key === selectedNiche);
  const formConfig = FORMS[selectedNiche];

  const handleNicheSelect = (key) => {
    setSelectedNiche(key);
    setFormData({});
    setLastAdded(null);
  };

  const setField = useCallback((key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  // ── Abre galeria e faz upload para ImgBB ──
  const pickPhoto = async (fieldKey) => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permissão necessária', 'Permita o acesso à galeria nas configurações.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.75,
      base64: true,
    });
    if (result.canceled) return;

    setUploadingKey(fieldKey);
    setUploading(true);
    try {
      const url = await uploadToImgBB(result.assets[0].base64);
      setField(fieldKey, url);
    } catch (err) {
      Alert.alert('❌ Erro no upload', err.message);
    } finally {
      setUploading(false);
      setUploadingKey(null);
    }
  };

  const validate = () => {
    for (const f of formConfig.fields) {
      if (f.type === 'photo') continue; // foto é opcional
      const val = formData[f.key];
      if (!val || String(val).trim() === '') {
        Alert.alert('Campo obrigatório', `Preencha "${f.label}" antes de enviar.`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      let payload = { ...formConfig.defaults };
      formConfig.fields.forEach(f => {
        let val = formData[f.key] ?? '';
        if (f.type === 'number')  val = parseInt(val, 10)  || 0;
        if (f.type === 'decimal') val = parseFloat(val)     || 0;
        payload[f.key] = val;
      });
      if (formConfig.transform) payload = formConfig.transform(payload);
      const path = formConfig.dynamicPath ? formConfig.dynamicPath(formData) : formConfig.path;
      await set(push(ref(DB, path)), payload);
      setLastAdded(formData.m || formData.n || formData.t || 'Item');
      setFormData({});
      Alert.alert('✅ Publicado!', 'O item já aparece no site em tempo real.');
    } catch (err) {
      console.error(err);
      Alert.alert('❌ Erro', err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Renderiza campo ──
  const renderField = (field) => {
    // CAMPO FOTO
    if (field.type === 'photo') {
      const url = formData[field.key];
      const isThisUploading = uploading && uploadingKey === field.key;
      return (
        <View key={field.key} style={styles.fieldWrap}>
          <Text style={[styles.label, { color: niche.color }]}>{field.label}</Text>
          <TouchableOpacity
            style={[styles.photoBtn, { borderColor: niche.color + '66' }]}
            onPress={() => pickPhoto(field.key)}
            disabled={uploading}
          >
            {isThisUploading ? (
              <View style={styles.photoBtnInner}>
                <ActivityIndicator color={niche.color} />
                <Text style={[styles.photoBtnText, { color: niche.color }]}>Enviando...</Text>
              </View>
            ) : url ? (
              <View style={styles.photoPreviewWrap}>
                <Image source={{ uri: url }} style={styles.photoPreview} />
                <View style={styles.photoPreviewOverlay}>
                  <Text style={styles.photoPreviewChange}>✏️ Trocar foto</Text>
                </View>
              </View>
            ) : (
              <View style={styles.photoBtnInner}>
                <Text style={styles.photoIcon}>📷</Text>
                <Text style={[styles.photoBtnText, { color: niche.color }]}>Escolher da galeria</Text>
                <Text style={styles.photoBtnSub}>Upload automático para ImgBB</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      );
    }

    // CAMPO SELECT
    if (field.type === 'select') {
      const val = formData[field.key] ?? '';
      return (
        <View key={field.key} style={styles.fieldWrap}>
          <Text style={[styles.label, { color: niche.color }]}>{field.label}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectRow}>
            {(field.options || []).map(opt => (
              <TouchableOpacity key={opt}
                style={[styles.selectChip, val === opt && { backgroundColor: niche.color, borderColor: niche.color }]}
                onPress={() => setField(field.key, opt)}>
                <Text style={[styles.selectChipText, val === opt && { color: '#000', fontWeight: '800' }]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      );
    }

    // CAMPO TEXTO / NÚMERO
    return (
      <View key={field.key} style={styles.fieldWrap}>
        <Text style={[styles.label, { color: niche.color }]}>{field.label}</Text>
        <TextInput
          style={[styles.input, { borderColor: niche.color + '55' }]}
          placeholder={field.placeholder}
          placeholderTextColor="rgba(255,255,255,0.3)"
          value={String(formData[field.key] ?? '')}
          onChangeText={v => setField(field.key, v)}
          keyboardType={field.type === 'number' ? 'numeric' : field.type === 'decimal' ? 'decimal-pad' : 'default'}
          autoCapitalize="none"
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: niche.bg }]}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

        <View style={[styles.header, { borderBottomColor: niche.color + '33' }]}>
          <Text style={[styles.headerTitle, { color: niche.color }]}>{niche.icon}  Site Camaleão</Text>
          <Text style={styles.headerSub}>Painel de Cadastro</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* SELETOR DE NICHO */}
          <Text style={styles.sectionLabel}>Selecionar Nicho</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            {NICHES.map(n => (
              <TouchableOpacity key={n.key}
                style={[styles.nicheChip, selectedNiche === n.key && { backgroundColor: n.color, borderColor: n.color }]}
                onPress={() => handleNicheSelect(n.key)}>
                <Text style={styles.nicheIcon}>{n.icon}</Text>
                <Text style={[styles.nicheLabel, selectedNiche === n.key && { color: '#000', fontWeight: '800' }]}>{n.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* FORMULÁRIO */}
          <View style={[styles.card, { borderColor: niche.color + '33' }]}>
            <Text style={[styles.cardTitle, { color: niche.color }]}>{formConfig.title}</Text>
            <Text style={styles.cardSub}>Foto + dados → Firebase → site atualiza em tempo real</Text>
            {formConfig.fields.map(renderField)}
            {lastAdded && (
              <View style={[styles.successBanner, { borderColor: niche.color }]}>
                <Text style={[styles.successText, { color: niche.color }]}>✅ "{lastAdded}" publicado!</Text>
              </View>
            )}
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: niche.color }, loading && { opacity: 0.6 }]}
              onPress={handleSubmit} disabled={loading || uploading}>
              {loading
                ? <ActivityIndicator color="#000" />
                : <Text style={styles.btnText}>Publicar no Site →</Text>}
            </TouchableOpacity>
          </View>

          {/* DICA IMGBB */}
          <View style={[styles.tip, { borderColor: niche.color + '22' }]}>
            <Text style={[styles.tipTitle, { color: niche.color }]}>📷 Como funciona o upload de fotos</Text>
            <Text style={styles.tipText}>
              1. Escolha a foto da galeria{'\n'}
              2. O app envia para o ImgBB (grátis){'\n'}
              3. O link é salvo no Firebase{'\n'}
              4. O site exibe a foto automaticamente{'\n\n'}
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── ESTILOS ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:            { flex: 1 },
  header:          { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14, borderBottomWidth: 1 },
  headerTitle:     { fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  headerSub:       { fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 2 },
  scroll:          { padding: 16, paddingBottom: 48 },
  sectionLabel:    { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.35)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 },
  nicheChip:       { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', marginRight: 8, backgroundColor: 'rgba(255,255,255,0.05)' },
  nicheIcon:       { fontSize: 16 },
  nicheLabel:      { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600' },
  card:            { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, borderWidth: 1, padding: 20, marginBottom: 16 },
  cardTitle:       { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  cardSub:         { fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 20, lineHeight: 18 },
  fieldWrap:       { marginBottom: 16 },
  label:           { fontSize: 10, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 6 },
  input:           { borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 13, paddingVertical: 11, fontSize: 14, color: '#fff', backgroundColor: 'rgba(255,255,255,0.06)' },
  selectRow:       { flexDirection: 'row', gap: 6, paddingHorizontal: 2 },
  selectChip:      { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.18)' },
  selectChipText:  { color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: '600' },
  photoBtn:        { borderWidth: 1.5, borderRadius: 12, borderStyle: 'dashed', overflow: 'hidden', minHeight: 100 },
  photoBtnInner:   { alignItems: 'center', justifyContent: 'center', padding: 20, gap: 6 },
  photoIcon:       { fontSize: 32 },
  photoBtnText:    { fontSize: 14, fontWeight: '700' },
  photoBtnSub:     { fontSize: 11, color: 'rgba(255,255,255,0.3)' },
  photoPreviewWrap:{ position: 'relative' },
  photoPreview:    { width: '100%', height: 180 },
  photoPreviewOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, alignItems: 'center' },
  photoPreviewChange: { color: '#fff', fontSize: 12, fontWeight: '700' },
  successBanner:   { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 14, backgroundColor: 'rgba(255,255,255,0.04)' },
  successText:     { fontSize: 13, fontWeight: '700' },
  btn:             { borderRadius: 10, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
  btnText:         { color: '#000', fontWeight: '900', fontSize: 15, letterSpacing: 0.5 },
  tip:             { borderRadius: 10, borderWidth: 1, padding: 16, marginBottom: 16 },
  tipTitle:        { fontSize: 13, fontWeight: '800', marginBottom: 8 },
  tipText:         { color: 'rgba(255,255,255,0.45)', fontSize: 12, lineHeight: 20 },
});
