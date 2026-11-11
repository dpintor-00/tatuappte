import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { useAuth } from '../context/AuthContext';
import { 
  Box, 
  Upload, 
  RotateCw, 
  Sliders, 
  Maximize2, 
  CheckCircle, 
  Info, 
  Flame, 
  Sparkles,
  Eye,
  RefreshCw,
  CalendarPlus,
  Compass
} from 'lucide-react';

// Diseños Flash predeterminados con SVG/DataURIs para pruebas inmediatas
const PRESET_DESIGNS = [
  {
    id: 'dragon',
    name: 'Dragón Ryū',
    category: 'Japonés',
    icon: '🐉',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="%230f172a" stroke-width="3"/><path d="M25,50 Q40,20 60,35 T80,50 T60,65 T25,50" fill="none" stroke="%23b91c1c" stroke-width="4"/><path d="M30,30 L45,45 M55,55 L70,70" stroke="%230f172a" stroke-width="2"/><circle cx="45" cy="35" r="3" fill="%23b91c1c"/></svg>'
  },
  {
    id: 'rose',
    name: 'Rosa Neotradicional',
    category: 'Neotrad',
    icon: '🌹',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 100 100"><circle cx="50" cy="50" r="24" fill="%23e11d48" stroke="%230f172a" stroke-width="4"/><circle cx="50" cy="50" r="14" fill="%23be123c"/><path d="M50,15 Q30,35 50,50 Q70,35 50,15" fill="%2315803d" stroke="%230f172a" stroke-width="2"/><path d="M20,65 Q35,70 50,50 Q65,70 80,65" fill="%2315803d" stroke="%230f172a" stroke-width="2"/></svg>'
  },
  {
    id: 'wolf',
    name: 'Lobo Geométrico',
    category: 'Blackwork',
    icon: '🐺',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 100 100"><polygon points="50,15 25,45 50,85 75,45" fill="none" stroke="%230f172a" stroke-width="4"/><polygon points="50,25 35,50 50,75 65,50" fill="none" stroke="%232563eb" stroke-width="3"/><line x1="50" y1="15" x2="50" y2="85" stroke="%230f172a" stroke-width="2"/><line x1="25" y1="45" x2="75" y2="45" stroke="%230f172a" stroke-width="2"/></svg>'
  },
  {
    id: 'dagger',
    name: 'Daga Tradicional',
    category: 'Old School',
    icon: '🗡️',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 100 100"><rect x="47" y="10" width="6" height="55" fill="%23475569" stroke="%230f172a" stroke-width="2"/><polygon points="50,90 40,65 60,65" fill="%2394a3b8" stroke="%230f172a" stroke-width="2"/><rect x="35" y="30" width="30" height="6" rx="3" fill="%23c59b27" stroke="%230f172a" stroke-width="2"/></svg>'
  },
  {
    id: 'mandala',
    name: 'Mandala Sagrado',
    category: 'Dotwork',
    icon: '☸️',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="%230f172a" stroke-width="2" stroke-dasharray="3,3"/><circle cx="50" cy="50" r="28" fill="none" stroke="%230f172a" stroke-width="2"/><polygon points="50,10 90,50 50,90 10,50" fill="none" stroke="%230f172a" stroke-width="2"/><polygon points="50,22 78,50 50,78 22,50" fill="none" stroke="%230f172a" stroke-width="1.5"/><circle cx="50" cy="50" r="8" fill="%230f172a"/></svg>'
  }
];

export const Probador3DView: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Three.js canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Parámetros del modelo y tatuaje
  const [estaturaCm, setEstaturaCm] = useState(175);
  const [contextura, setContextura] = useState<'delgada' | 'atletica' | 'robusta'>('atletica');
  const [anchoCm, setAnchoCm] = useState(12);
  const [altoCm, setAltoCm] = useState(16);
  const [rotacionDeg, setRotacionDeg] = useState(0);
  const [opacidad, setOpacidad] = useState(90);
  
  // Imagen seleccionada
  const [selectedImage, setSelectedImage] = useState<string>(PRESET_DESIGNS[0].url);
  const [selectedDesignName, setSelectedDesignName] = useState(PRESET_DESIGNS[0].name);
  const [tattooPlaced, setTattooPlaced] = useState(false);
  const [placedLocation, setPlacedLocation] = useState('Brazo / Pecho');

  // Three.js state references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const mannequinGroupRef = useRef<THREE.Group | null>(null);
  const decalMeshRef = useRef<THREE.Mesh | null>(null);
  const isDraggingRef = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  // Cálculo de presupuesto en tiempo real (Pesos Chilenos)
  const quote = useMemo(() => {
    const areaCm2 = anchoCm * altoCm;
    const baseHigiene = 35000; // Base insumos
    const valorPorCm2 = 650; // CLP por cm2
    const horasEstimadas = Math.max(1, Math.round((areaCm2 / 30) * 10) / 10);
    const totalCLP = baseHigiene + (areaCm2 * valorPorCm2);

    return {
      areaCm2,
      horasEstimadas,
      baseHigiene,
      totalCLP: Math.round(totalCLP / 1000) * 1000 // Redondear a miles
    };
  }, [anchoCm, altoCm]);

  const formatCLP = (val: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);
  };

  // Subir imagen personalizada
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
          setSelectedDesignName(file.name.replace(/\.[^/.]+$/, ''));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Inicializar Three.js
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 580;

    // Escena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    sceneRef.current = scene;

    // Cámara
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 3.8);
    cameraRef.current = camera;

    // Renderizador
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Luces de Estudio
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(3, 4, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 0.6);
    rimLight.position.set(-3, 3, -3);
    scene.add(rimLight);

    // Suelo con sombra suave
    const floorGeo = new THREE.PlaneGeometry(10, 10);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.08 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.05;
    floor.receiveShadow = true;
    scene.add(floor);

    // Pedestal de estudio circular
    const pedestalGeo = new THREE.CylinderGeometry(0.85, 0.95, 0.08, 36);
    const pedestalMat = new THREE.MeshStandardMaterial({ 
      color: 0xe2e8f0, 
      roughness: 0.6 
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = 0.04;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Crear Maniquí Humanoide Proporcional Anatómico
    const mannequinGroup = new THREE.Group();
    mannequinGroupRef.current = mannequinGroup;

    // Material de piel studio matte
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: 0xdec0a9,
      roughness: 0.45,
      metalness: 0.05
    });

    const jointMaterial = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.4
    });

    // 1. Torso / Pecho
    const chestGeo = new THREE.CylinderGeometry(0.24, 0.20, 0.50, 24);
    const chest = new THREE.Mesh(chestGeo, skinMaterial);
    chest.position.y = 1.45;
    chest.castShadow = true;
    chest.receiveShadow = true;
    mannequinGroup.add(chest);

    // 2. Abdomen
    const absGeo = new THREE.CylinderGeometry(0.19, 0.17, 0.35, 24);
    const abs = new THREE.Mesh(absGeo, skinMaterial);
    abs.position.y = 1.08;
    abs.castShadow = true;
    abs.receiveShadow = true;
    mannequinGroup.add(abs);

    // 3. Cadera / Pelvis
    const pelvisGeo = new THREE.CylinderGeometry(0.18, 0.16, 0.22, 24);
    const pelvis = new THREE.Mesh(pelvisGeo, skinMaterial);
    pelvis.position.y = 0.82;
    pelvis.castShadow = true;
    mannequinGroup.add(pelvis);

    // 4. Cabeza & Cuello
    const neckGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.14, 18);
    const neck = new THREE.Mesh(neckGeo, skinMaterial);
    neck.position.y = 1.76;
    mannequinGroup.add(neck);

    const headGeo = new THREE.SphereGeometry(0.15, 24, 24);
    headGeo.scale(1, 1.25, 1.05);
    const head = new THREE.Mesh(headGeo, skinMaterial);
    head.position.y = 1.95;
    head.castShadow = true;
    mannequinGroup.add(head);

    // 5. Hombros y Brazos
    // Hombro Izquierdo
    const leftShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), jointMaterial);
    leftShoulder.position.set(-0.32, 1.62, 0);
    mannequinGroup.add(leftShoulder);

    // Brazo Superior Izquierdo
    const lUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.35, 18), skinMaterial);
    lUpperArm.position.set(-0.35, 1.40, 0);
    lUpperArm.rotation.z = 0.12;
    lUpperArm.castShadow = true;
    mannequinGroup.add(lUpperArm);

    // Antebrazo Izquierdo
    const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.05, 0.35, 18), skinMaterial);
    lForearm.position.set(-0.39, 1.05, 0.05);
    lForearm.rotation.z = 0.18;
    lForearm.castShadow = true;
    mannequinGroup.add(lForearm);

    // Hombro Derecho
    const rightShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), jointMaterial);
    rightShoulder.position.set(0.32, 1.62, 0);
    mannequinGroup.add(rightShoulder);

    // Brazo Superior Derecho
    const rUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.35, 18), skinMaterial);
    rUpperArm.position.set(0.35, 1.40, 0);
    rUpperArm.rotation.z = -0.12;
    rUpperArm.castShadow = true;
    mannequinGroup.add(rUpperArm);

    // Antebrazo Derecho
    const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.05, 0.35, 18), skinMaterial);
    rForearm.position.set(0.39, 1.05, 0.05);
    rForearm.rotation.z = -0.18;
    rForearm.castShadow = true;
    mannequinGroup.add(rForearm);

    // 6. Piernas
    // Muslo Izquierdo
    const lThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.08, 0.42, 18), skinMaterial);
    lThigh.position.set(-0.11, 0.52, 0);
    lThigh.castShadow = true;
    mannequinGroup.add(lThigh);

    // Pantorrilla Izquierda
    const lCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.42, 18), skinMaterial);
    lCalf.position.set(-0.11, 0.15, 0);
    lCalf.castShadow = true;
    mannequinGroup.add(lCalf);

    // Muslo Derecho
    const rThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.08, 0.42, 18), skinMaterial);
    rThigh.position.set(0.11, 0.52, 0);
    rThigh.castShadow = true;
    mannequinGroup.add(rThigh);

    // Pantorrilla Derecha
    const rCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.42, 18), skinMaterial);
    rCalf.position.set(0.11, 0.15, 0);
    rCalf.castShadow = true;
    mannequinGroup.add(rCalf);

    scene.add(mannequinGroup);

    // Decal inicial de muestra proyectado en el pecho
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(selectedImage, (texture) => {
      const tattooGeo = new THREE.PlaneGeometry(0.24, 0.28);
      const tattooMat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: opacidad / 100,
        polygonOffset: true,
        polygonOffsetFactor: -4
      });
      const tattooMesh = new THREE.Mesh(tattooGeo, tattooMat);
      tattooMesh.position.set(0, 1.48, 0.23); // En el pecho
      decalMeshRef.current = tattooMesh;
      mannequinGroup.add(tattooMesh);
      setTattooPlaced(true);
    });

    // Loop de renderizado
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const newW = containerRef.current.clientWidth;
      const newH = containerRef.current.clientHeight || 580;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, []);

  // Actualizar textura, escala, rotación u opacidad del tatuaje en el modelo 3D
  useEffect(() => {
    if (!mannequinGroupRef.current) return;

    // Escalar proporciones anatómicas según contexto y estatura
    const heightScale = estaturaCm / 175;
    const bodyWidthScale = contextura === 'delgada' ? 0.9 : contextura === 'robusta' ? 1.25 : 1.05;
    mannequinGroupRef.current.scale.set(bodyWidthScale, heightScale, bodyWidthScale);

    // Si ya existe el tatuaje en el cuerpo, actualizar sus dimensiones visuales y textura
    if (decalMeshRef.current) {
      const tattooWidth3D = (anchoCm / 100) * 1.5;
      const tattooHeight3D = (altoCm / 100) * 1.5;
      decalMeshRef.current.scale.set(tattooWidth3D, tattooHeight3D, 1);
      decalMeshRef.current.rotation.z = (rotacionDeg * Math.PI) / 180;

      // Actualizar opacidad
      const mat = decalMeshRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = opacidad / 100;
      }
    }
  }, [estaturaCm, contextura, anchoCm, altoCm, rotacionDeg, opacidad]);

  // Cambiar textura cuando cambia la imagen seleccionada
  useEffect(() => {
    if (!decalMeshRef.current) return;
    const loader = new THREE.TextureLoader();
    loader.load(selectedImage, (tex) => {
      const mat = decalMeshRef.current?.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.map = tex;
        mat.needsUpdate = true;
      }
    });
  }, [selectedImage]);

  // Click Raycaster para posicionar el tatuaje en cualquier parte del cuerpo
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const camera = cameraRef.current;
    const scene = sceneRef.current;
    const mannequinGroup = mannequinGroupRef.current;

    if (!canvas || !camera || !scene || !mannequinGroup) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

    // Intersectar con las partes del cuerpo humanoide
    const intersects = raycaster.intersectObjects(mannequinGroup.children, true);

    // Excluir el propio decal
    const validIntersect = intersects.find(item => item.object !== decalMeshRef.current);

    if (validIntersect && validIntersect.point) {
      const hitPoint = validIntersect.point;
      const normal = validIntersect.face?.normal?.clone() || new THREE.Vector3(0, 0, 1);

      // Si no existe decalMesh, crearlo
      if (!decalMeshRef.current) {
        const tattooGeo = new THREE.PlaneGeometry(0.24, 0.28);
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(selectedImage, (texture) => {
          const tattooMat = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: opacidad / 100,
            polygonOffset: true,
            polygonOffsetFactor: -4
          });
          const tattooMesh = new THREE.Mesh(tattooGeo, tattooMat);
          decalMeshRef.current = tattooMesh;
          scene.add(tattooMesh);
        });
      }

      if (decalMeshRef.current) {
        // Mover a la coordenada de impacto ligeramente orientada hacia la normal
        const offsetPoint = hitPoint.clone().add(normal.clone().multiplyScalar(0.015));
        
        // Convertir coordenada del mundo al espacio local del grupo
        decalMeshRef.current.position.copy(mannequinGroup.worldToLocal(offsetPoint));
        
        // Orientar el plano hacia la normal de la superficie
        decalMeshRef.current.lookAt(offsetPoint.clone().add(normal));

        // Determinar zona anatómica aproximada
        if (hitPoint.y > 1.6) setPlacedLocation('Cuello / Hombro');
        else if (hitPoint.y > 1.3 && Math.abs(hitPoint.x) > 0.25) setPlacedLocation('Brazo Superior');
        else if (hitPoint.y > 0.9 && Math.abs(hitPoint.x) > 0.25) setPlacedLocation('Antebrazo');
        else if (hitPoint.y > 1.2 && hitPoint.z > 0) setPlacedLocation('Pectoral / Pecho');
        else if (hitPoint.y > 1.2 && hitPoint.z < 0) setPlacedLocation('Espalda / Omóplato');
        else if (hitPoint.y > 0.9) setPlacedLocation('Costillas / Abdomen');
        else setPlacedLocation('Pierna / Muslo');

        setTattooPlaced(true);
      }
    }
  };

  // Rotación manual del maniquí con el ratón
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !mannequinGroupRef.current) return;
    const deltaX = e.clientX - previousMousePosition.current.x;
    mannequinGroupRef.current.rotation.y += deltaX * 0.01;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Presets de vistas
  const setCameraView = (view: 'front' | 'back' | 'profile' | 'reset') => {
    if (!mannequinGroupRef.current || !cameraRef.current) return;
    if (view === 'front') {
      mannequinGroupRef.current.rotation.y = 0;
      cameraRef.current.position.set(0, 1.2, 3.8);
    } else if (view === 'back') {
      mannequinGroupRef.current.rotation.y = Math.PI;
      cameraRef.current.position.set(0, 1.2, 3.8);
    } else if (view === 'profile') {
      mannequinGroupRef.current.rotation.y = Math.PI / 2;
      cameraRef.current.position.set(0, 1.2, 3.8);
    } else if (view === 'reset') {
      mannequinGroupRef.current.rotation.y = 0;
      cameraRef.current.position.set(0, 1.2, 3.8);
      setAnchoCm(12);
      setAltoCm(16);
      setRotacionDeg(0);
      setOpacidad(90);
    }
  };

  const handleScheduleQuote = async () => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 3);
      const dateStr = tomorrow.toISOString().split('T')[0];

      await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: user?.id,
          client_name: user?.username || 'Cliente del Estudio',
          tattooist_id: 'tatt_01',
          tattooist_name: 'Carlos Ink (Blackwork)',
          date: dateStr,
          time: '16:00',
          status: 'pending',
          price: quote.totalCLP,
          design_data: {
            widthCm: anchoCm,
            heightCm: altoCm,
            rotation: rotacionDeg,
            opacity: opacidad,
            bodyLocation: placedLocation,
            notes: `Diseño: ${selectedDesignName}`
          }
        })
      });
    } catch (err) {
      console.error('Error al guardar cita en backend:', err);
    }
    navigate('/dashboard');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* View Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold mb-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Módulo Probador 3D &bull; TatuAppte</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Probador 3D & Cotizador en Tiempo Real
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Sube tu diseño o prueba un flash, proyecta el tatuaje en el modelo 3D y obtén un presupuesto al instante.
          </p>
        </div>

        <button
          onClick={handleScheduleQuote}
          className="inline-flex items-center gap-2 px-5 py-3 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-lg shadow-slate-950/20 hover:scale-105 transition-all"
        >
          <CalendarPlus className="w-4 h-4 text-amber-400" />
          <span>Agendar con esta Cotización</span>
        </button>
      </div>

      {/* Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* PANEL IZQUIERDO: Controles, Sliders, Upload & Presupuesto (5 Columnas) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Tarjeta de Parámetros Anatómicos y del Tatuaje */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_15px_35px_rgba(15,23,42,0.05)] space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-slate-700" />
                <h2 className="text-sm font-extrabold text-slate-900">Parámetros del Tatuaje & Cuerpo</h2>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                Paso 1 de 2
              </span>
            </div>

            {/* Slider Estatura */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-700">Estatura del Modelo</label>
                <span className="text-xs font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                  {estaturaCm} cm
                </span>
              </div>
              <input
                type="range"
                min={150}
                max={205}
                value={estaturaCm}
                onChange={(e) => setEstaturaCm(Number(e.target.value))}
                className="w-full accent-slate-900 cursor-pointer"
              />
            </div>

            {/* Selector Contextura */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Contextura Corporal</label>
              <div className="grid grid-cols-3 gap-2">
                {(['delgada', 'atletica', 'robusta'] as const).map((ctx) => (
                  <button
                    key={ctx}
                    type="button"
                    onClick={() => setContextura(ctx)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl capitalize transition-all ${
                      contextura === ctx
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {ctx}
                  </button>
                ))}
              </div>
            </div>

            {/* Medidas en cm (Ancho x Alto) */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">Ancho</label>
                  <span className="text-xs font-black text-slate-900">{anchoCm} cm</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={35}
                  value={anchoCm}
                  onChange={(e) => setAnchoCm(Number(e.target.value))}
                  className="w-full accent-slate-900 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">Alto</label>
                  <span className="text-xs font-black text-slate-900">{altoCm} cm</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={45}
                  value={altoCm}
                  onChange={(e) => setAltoCm(Number(e.target.value))}
                  className="w-full accent-slate-900 cursor-pointer"
                />
              </div>
            </div>

            {/* Rotación y Opacidad */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">Rotación</label>
                  <span className="text-xs font-black text-slate-900">{rotacionDeg}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={rotacionDeg}
                  onChange={(e) => setRotacionDeg(Number(e.target.value))}
                  className="w-full accent-slate-900 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">Opacidad Tinta</label>
                  <span className="text-xs font-black text-slate-900">{opacidad}%</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={100}
                  value={opacidad}
                  onChange={(e) => setOpacidad(Number(e.target.value))}
                  className="w-full accent-slate-900 cursor-pointer"
                />
              </div>
            </div>

            {/* Selector de Diseños Flash & Subida */}
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Diseño Flash o Sube tu Imagen
              </label>

              {/* Botones de Presets */}
              <div className="grid grid-cols-5 gap-2 mb-3">
                {PRESET_DESIGNS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setSelectedImage(d.url);
                      setSelectedDesignName(d.name);
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                      selectedDesignName === d.name
                        ? 'border-slate-950 bg-slate-900 text-white shadow-sm'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                    title={d.name}
                  >
                    <span className="text-lg">{d.icon}</span>
                    <span className="text-[9px] font-bold truncate max-w-full mt-1">{d.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>

              {/* Input para subir imagen personalizada */}
              <label className="flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer text-xs font-bold text-slate-700 transition-colors">
                <Upload className="w-4 h-4 text-slate-400" />
                <span>Subir archivo PNG/JPG transparente</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

          </div>

          {/* Tarjeta de Presupuesto en Tiempo Real (Pesos Chilenos) */}
          <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-950/20 relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                  Presupuesto Estimado
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-semibold">CLP (Pesos Chilenos)</span>
            </div>

            {/* Gran Número de Presupuesto */}
            <div className="mb-4">
              <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {formatCLP(quote.totalCLP)}
              </p>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span>Superficie: <strong>{quote.areaCm2} cm²</strong></span>
                <span>&bull;</span>
                <span>Sesión estimada: <strong>{quote.horasEstimadas} hrs</strong></span>
              </p>
            </div>

            {/* Desglose */}
            <div className="space-y-2 border-t border-slate-800 pt-3 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Base higiénica & agujas estériles</span>
                <span className="font-semibold text-white">{formatCLP(quote.baseHigiene)}</span>
              </div>
              <div className="flex justify-between">
                <span>Valor por superficie ({quote.areaCm2} cm² × $650)</span>
                <span className="font-semibold text-white">{formatCLP(quote.areaCm2 * 650)}</span>
              </div>
              <div className="flex justify-between text-amber-400 font-bold pt-1">
                <span>Zona Anatómica Detectada</span>
                <span>{placedLocation}</span>
              </div>
            </div>

            <button
              onClick={handleScheduleQuote}
              className="w-full mt-5 py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-950 text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Solicitar Cita con este Presupuesto</span>
            </button>
          </div>

        </div>

        {/* PANEL DERECHO: Canvas Three.js Modelo 3D (7 Columnas) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-[0_15px_35px_rgba(15,23,42,0.05)] relative flex flex-col">
            
            {/* Top Toolbar de la escena 3D */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-extrabold text-slate-900">Visor Humanoide 3D</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                  WebGL Activo
                </span>
              </div>

              {/* Botones de ángulos de cámara */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setCameraView('front')}
                  className="px-2.5 py-1 rounded-lg font-bold text-slate-700 hover:bg-white transition-colors"
                >
                  Frente
                </button>
                <button
                  type="button"
                  onClick={() => setCameraView('profile')}
                  className="px-2.5 py-1 rounded-lg font-bold text-slate-700 hover:bg-white transition-colors"
                >
                  Perfil
                </button>
                <button
                  type="button"
                  onClick={() => setCameraView('back')}
                  className="px-2.5 py-1 rounded-lg font-bold text-slate-700 hover:bg-white transition-colors"
                >
                  Espalda
                </button>
                <button
                  type="button"
                  onClick={() => setCameraView('reset')}
                  className="p-1 text-slate-400 hover:text-slate-800 transition-colors"
                  title="Restablecer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Canvas Container */}
            <div 
              ref={containerRef}
              className="w-full h-[540px] sm:h-[620px] rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/80 relative overflow-hidden border border-slate-200/60 cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="w-full h-full block"
              />

              {/* Guía Flotante al usuario */}
              <div className="absolute top-4 left-4 pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm text-[11px] font-semibold text-slate-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                  <span>Haz clic en el cuerpo para estampar el tatuaje</span>
                </div>
              </div>

              {/* Floating Status Badge en el Canvas */}
              <div className="absolute bottom-4 right-4 pointer-events-none">
                <div className="bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5 shadow-md">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ubicación: {placedLocation}</span>
                </div>
              </div>

              {/* Floating Camera Rotation Tip */}
              <div className="absolute bottom-4 left-4 pointer-events-none hidden sm:block">
                <span className="text-[10px] font-semibold text-slate-400 bg-white/70 px-2.5 py-1 rounded-lg">
                  Arrastra con el ratón para rotar 360°
                </span>
              </div>
            </div>

            {/* Footer explicativo */}
            <p className="text-[11px] text-slate-400 mt-3 text-center">
              Diseño seleccionado: <strong className="text-slate-700">{selectedDesignName}</strong> ({anchoCm}x{altoCm} cm, {rotacionDeg}°). La proyección se adhiere a la malla anatómica con sombreado de textura en tiempo real.
            </p>

          </div>
        </div>

      </div>

    </div>
  );
};
