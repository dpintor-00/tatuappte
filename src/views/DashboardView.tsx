import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Appointment, Schedule } from '../types';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Box, 
  Plus, 
  User as UserIcon, 
  DollarSign, 
  Layers, 
  Filter, 
  ChevronRight, 
  Sparkles,
  Phone,
  Mail,
  Sliders,
  Settings
} from 'lucide-react';

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-101',
    client_id: 'usr_01',
    client_name: 'Alex Valenzuela',
    tattooist_id: 'tatt_01',
    tattooist_name: 'Carlos Ink (Blackwork)',
    date: '2026-11-18',
    time: '15:30',
    status: 'confirmed',
    price: 135000,
    design_data: {
      widthCm: 15,
      heightCm: 10,
      rotation: 45,
      opacity: 90,
      bodyLocation: 'Antebrazo Derecho',
      notes: 'Líneas finas con sombreado whip shading'
    }
  },
  {
    id: 'apt-102',
    client_id: 'usr_02',
    client_name: 'Fernanda Ríos',
    tattooist_id: 'tatt_01',
    tattooist_name: 'Carlos Ink (Blackwork)',
    date: '2026-11-20',
    time: '11:00',
    status: 'pending',
    price: 180000,
    design_data: {
      widthCm: 18,
      heightCm: 12,
      rotation: 0,
      opacity: 100,
      bodyLocation: 'Omóplato / Espalda',
      notes: 'Diseño geométrico sagrado testeado en 3D'
    }
  },
  {
    id: 'apt-103',
    client_id: 'usr_03',
    client_name: 'Matías Silva',
    tattooist_id: 'tatt_02',
    tattooist_name: 'Elena Tatuajes (Neotradicional)',
    date: '2026-11-22',
    time: '17:00',
    status: 'confirmed',
    price: 95000,
    design_data: {
      widthCm: 8,
      heightCm: 8,
      rotation: 15,
      opacity: 85,
      bodyLocation: 'Pantorrilla',
      notes: 'Rosa neotradicional a color'
    }
  }
];

const INITIAL_SCHEDULES: Schedule[] = [
  { id: 'sch-1', tattooist_id: 'tatt_01', day_of_week: 1, day_name: 'Lunes', start_time: '11:00', end_time: '20:00', is_active: true },
  { id: 'sch-2', tattooist_id: 'tatt_01', day_of_week: 2, day_name: 'Martes', start_time: '11:00', end_time: '20:00', is_active: true },
  { id: 'sch-3', tattooist_id: 'tatt_01', day_of_week: 3, day_name: 'Miércoles', start_time: '11:00', end_time: '20:00', is_active: true },
  { id: 'sch-4', tattooist_id: 'tatt_01', day_of_week: 4, day_name: 'Jueves', start_time: '11:00', end_time: '20:00', is_active: true },
  { id: 'sch-5', tattooist_id: 'tatt_01', day_of_week: 5, day_name: 'Viernes', start_time: '12:00', end_time: '21:00', is_active: true },
  { id: 'sch-6', tattooist_id: 'tatt_01', day_of_week: 6, day_name: 'Sábado', start_time: '12:00', end_time: '19:00', is_active: true },
  { id: 'sch-7', tattooist_id: 'tatt_01', day_of_week: 0, day_name: 'Domingo', start_time: '00:00', end_time: '00:00', is_active: false },
];

export const DashboardView: React.FC = () => {
  const { user, role } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [schedules, setSchedules] = useState<Schedule[]>(INITIAL_SCHEDULES);
  const [activeTab, setActiveTab] = useState<'appointments' | 'schedules' | 'pricing'>('appointments');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');

  // Cargar citas y disponibilidad desde la API / Supabase
  useEffect(() => {
    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => {
        if (data.appointments && Array.isArray(data.appointments)) {
          setAppointments(data.appointments);
        }
      })
      .catch(err => console.warn('Usando citas iniciales:', err));

    fetch('/api/schedules')
      .then(res => res.json())
      .then(data => {
        if (data.schedules && Array.isArray(data.schedules)) {
          setSchedules(data.schedules);
        }
      })
      .catch(err => console.warn('Usando horarios iniciales:', err));
  }, []);

  const formatCLP = (amount: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);
  };

  const handleStatusChange = async (id: string, newStatus: Appointment['status']) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    try {
      await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.error('Error al actualizar estado en backend:', err);
    }
  };

  const toggleScheduleDay = (id: string) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, is_active: !s.is_active } : s));
  };

  const filteredAppointments = appointments.filter(a => {
    if (statusFilter === 'all') return true;
    return a.status === statusFilter;
  });

  const totalRevenue = appointments
    .filter(a => a.status === 'confirmed' || a.status === 'completed')
    .reduce((sum, a) => sum + a.price, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_15px_35px_rgba(15,23,42,0.04)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200/60 rounded-full text-xs font-bold text-amber-900 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Panel {role === 'tattooist' ? 'del Tatuador / Estudio' : 'del Cliente'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hola, {user?.username || 'Artista'}
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            {role === 'tattooist'
              ? 'Controla las solicitudes de citas, organiza tu disponibilidad semanal y revisa los diseños cotizados en 3D.'
              : 'Revisa el estado de tus citas agendadas o proyecta un nuevo diseño con el cotizador 3D interactivo.'}
          </p>
        </div>

        {/* CTA Button */}
        <Link
          to="/probador"
          className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-slate-950 hover:bg-slate-800 text-white text-sm font-bold rounded-2xl shadow-lg shadow-slate-950/20 hover:scale-105 transition-all shrink-0"
        >
          <Box className="w-5 h-5 text-amber-400" />
          <span>{role === 'tattooist' ? 'Abrir Cotizador 3D' : 'Cotizar Nuevo Tatuaje 3D'}</span>
        </Link>
      </div>

      {/* Quick KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 mb-3">
            <Calendar className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-400">Citas Totales</p>
          <p className="text-2xl font-black text-slate-900 mt-0.5">{appointments.length}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-400">Por Confirmar</p>
          <p className="text-2xl font-black text-amber-600 mt-0.5">
            {appointments.filter(a => a.status === 'pending').length}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3">
            <CheckCircle className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-400">Confirmadas</p>
          <p className="text-2xl font-black text-emerald-600 mt-0.5">
            {appointments.filter(a => a.status === 'confirmed').length}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
            <DollarSign className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-400">
            {role === 'tattooist' ? 'Ingresos Estimados' : 'Presupuesto Total'}
          </p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{formatCLP(totalRevenue)}</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`flex items-center gap-2 pb-3.5 px-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'appointments'
              ? 'border-slate-950 text-slate-950'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Gestión de Citas ({appointments.length})</span>
        </button>

        {role === 'tattooist' && (
          <>
            <button
              onClick={() => setActiveTab('schedules')}
              className={`flex items-center gap-2 pb-3.5 px-4 text-sm font-bold border-b-2 transition-all ${
                activeTab === 'schedules'
                  ? 'border-slate-950 text-slate-950'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Horarios & Disponibilidad</span>
            </button>

            <button
              onClick={() => setActiveTab('pricing')}
              className={`flex items-center gap-2 pb-3.5 px-4 text-sm font-bold border-b-2 transition-all ${
                activeTab === 'pricing'
                  ? 'border-slate-950 text-slate-950'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Parámetros de Cotización</span>
            </button>
          </>
        )}
      </div>

      {/* TAB 1: Appointments List */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-600">Filtrar por estado:</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['all', 'pending', 'confirmed', 'completed'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    statusFilter === filter
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter === 'all' ? 'Todas' : filter === 'pending' ? 'Pendientes' : filter === 'confirmed' ? 'Confirmadas' : 'Completadas'}
                </button>
              ))}
            </div>
          </div>

          {/* Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAppointments.map((apt) => (
              <div 
                key={apt.id}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Status Badge & Date */}
                  <div className="flex items-center justify-between mb-3">
                    <span 
                      className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full ${
                        apt.status === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : apt.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {apt.status === 'confirmed' ? 'Confirmada' : apt.status === 'pending' ? 'Por Confirmar' : 'Completada'}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">ID: {apt.id}</span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900">
                    {role === 'tattooist' ? apt.client_name : apt.tattooist_name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {apt.design_data.bodyLocation} &bull; {apt.design_data.widthCm}x{apt.design_data.heightCm} cm
                  </p>

                  {/* Date & Time pill */}
                  <div className="flex items-center gap-3 my-3 p-2.5 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {apt.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {apt.time} hrs
                    </span>
                  </div>

                  {/* Notes */}
                  {apt.design_data.notes && (
                    <p className="text-xs text-slate-500 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100/60 mb-3">
                      "{apt.design_data.notes}"
                    </p>
                  )}
                </div>

                {/* Price & Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Cotización</span>
                    <span className="text-sm font-extrabold text-slate-900">{formatCLP(apt.price)}</span>
                  </div>

                  {role === 'tattooist' && apt.status === 'pending' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleStatusChange(apt.id, 'confirmed')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        Aceptar
                      </button>
                      <button
                        onClick={() => handleStatusChange(apt.id, 'cancelled')}
                        className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition-colors"
                      >
                        Rechazar
                      </button>
                    </div>
                  )}

                  {apt.status === 'confirmed' && (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Agendado
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Schedule & Availability (Tattooist) */}
      {activeTab === 'schedules' && role === 'tattooist' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Configuración de Horario Semanal</h2>
            <p className="text-xs text-slate-500 mt-1">
              Activa los días en los que atiendes en el estudio y define las ventanas horarias disponibles para los clientes.
            </p>
          </div>

          <div className="space-y-3">
            {schedules.map((sch) => (
              <div 
                key={sch.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  sch.is_active
                    ? 'bg-slate-50/80 border-slate-200'
                    : 'bg-white border-slate-100 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={sch.is_active}
                    onChange={() => toggleScheduleDay(sch.id)}
                    className="w-4 h-4 text-slate-900 rounded focus:ring-slate-900"
                  />
                  <div>
                    <span className="text-sm font-bold text-slate-900">{sch.day_name}</span>
                    <span className={`text-[11px] ml-2 px-2 py-0.5 rounded-full font-bold ${
                      sch.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {sch.is_active ? 'Disponible' : 'Cerrado'}
                    </span>
                  </div>
                </div>

                {sch.is_active && (
                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                    <span className="text-slate-400">Horario de atención:</span>
                    <input
                      type="time"
                      defaultValue={sch.start_time}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <span>a</span>
                    <input
                      type="time"
                      defaultValue={sch.end_time}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => alert('Disponibilidad guardada correctamente en Supabase.')}
              className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Guardar Cambios de Agenda
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: Pricing Parameters (Tattooist) */}
      {activeTab === 'pricing' && role === 'tattooist' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Parámetros de Cotización Automática (CLP)</h2>
            <p className="text-xs text-slate-500 mt-1">
              Estos valores alimentan la fórmula del probador 3D para calcular presupuestos estimados en tiempo real.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Tarifa Base / Insumos
              </label>
              <p className="text-[11px] text-slate-400 mb-3">Coste mínimo por apertura de agujas y campo estéril.</p>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-bold">$</span>
                <input
                  type="number"
                  defaultValue={35000}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Valor por cm² (Superficie)
              </label>
              <p className="text-[11px] text-slate-400 mb-3">Multiplicador por área proyectada en el modelo 3D.</p>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-bold">$</span>
                <input
                  type="number"
                  defaultValue={850}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Valor Hora de Tatuaje
              </label>
              <p className="text-[11px] text-slate-400 mb-3">Para sesiones complejas o piezas de gran tamaño.</p>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-bold">$</span>
                <input
                  type="number"
                  defaultValue={45000}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => alert('Parámetros de cotización actualizados correctamente.')}
              className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Actualizar Precios en Probador 3D
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
