import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const serviceColors = {
  coloracao: 'bg-rose-100 text-rose-700 border-rose-300',
  estilo: 'bg-purple-100 text-purple-700 border-purple-300',
  closet: 'bg-blue-100 text-blue-700 border-blue-300',
  personal_shopping: 'bg-pink-100 text-pink-700 border-pink-300',
  followup: 'bg-green-100 text-green-700 border-green-300',
  outro: 'bg-gray-100 text-gray-700 border-gray-300'
};

export default function CalendarView({ appointments, onSelectDate, onSelectAppointment, view = 'month' }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getWeekDays = (date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const getAppointmentsForDate = (date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const navigateDay = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const renderMonthView = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-100 bg-gray-50" />);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayAppointments = getAppointmentsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      
      days.push(
        <motion.div
          key={day}
          whileHover={{ scale: 1.02 }}
          onClick={() => onSelectDate(date)}
          className={`h-24 border border-gray-200 p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
            isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'
          }`}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayAppointments.slice(0, 2).map(apt => (
              <div
                key={apt.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectAppointment(apt);
                }}
                className={`text-xs p-1 rounded border truncate ${serviceColors[apt.service_type]}`}
              >
                {new Date(apt.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            ))}
            {dayAppointments.length > 2 && (
              <div className="text-xs text-gray-500">+{dayAppointments.length - 2} mais</div>
            )}
          </div>
        </motion.div>
      );
    }
    
    return (
      <div className="grid grid-cols-7 gap-0">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="text-center font-semibold text-sm py-2 bg-gray-100 border border-gray-200">
            {day}
          </div>
        ))}
        {days}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);
    const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8h às 21h
    
    return (
      <div className="grid grid-cols-8 gap-0 border border-gray-200">
        <div className="bg-gray-100 border-r border-gray-200" />
        {weekDays.map(day => {
          const isToday = day.toDateString() === new Date().toDateString();
          return (
            <div key={day.toISOString()} className={`text-center py-2 border-r border-gray-200 ${isToday ? 'bg-blue-50' : 'bg-gray-50'}`}>
              <div className="text-xs text-gray-500">
                {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
              </div>
              <div className={`text-lg font-semibold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                {day.getDate()}
              </div>
            </div>
          );
        })}
        
        {hours.map(hour => (
          <React.Fragment key={hour}>
            <div className="text-xs text-gray-500 text-right pr-2 py-2 border-t border-r border-gray-200 bg-gray-50">
              {hour}:00
            </div>
            {weekDays.map(day => {
              const dayAppointments = getAppointmentsForDate(day).filter(apt => {
                const aptHour = new Date(apt.date).getHours();
                return aptHour === hour;
              });
              
              return (
                <div key={`${day.toISOString()}-${hour}`} className="relative border-t border-r border-gray-200 p-1 min-h-[60px]">
                  {dayAppointments.map(apt => (
                    <div
                      key={apt.id}
                      onClick={() => onSelectAppointment(apt)}
                      className={`text-xs p-2 rounded mb-1 cursor-pointer hover:opacity-80 ${serviceColors[apt.service_type]}`}
                    >
                      <div className="font-medium truncate">
                        {new Date(apt.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 14 }, (_, i) => i + 8);
    const dayAppointments = getAppointmentsForDate(currentDate);
    
    return (
      <div className="space-y-0 border border-gray-200">
        {hours.map(hour => {
          const hourAppointments = dayAppointments.filter(apt => {
            const aptHour = new Date(apt.date).getHours();
            return aptHour === hour;
          });
          
          return (
            <div key={hour} className="flex border-b border-gray-200">
              <div className="w-20 text-sm text-gray-500 text-right pr-3 py-3 bg-gray-50 border-r border-gray-200">
                {hour}:00
              </div>
              <div className="flex-1 p-2 min-h-[80px]">
                {hourAppointments.map(apt => (
                  <div
                    key={apt.id}
                    onClick={() => onSelectAppointment(apt)}
                    className={`p-3 rounded-lg mb-2 cursor-pointer hover:shadow-md transition-shadow border ${serviceColors[apt.service_type]}`}
                  >
                    <div className="font-semibold">
                      {new Date(apt.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {apt.duration}min
                    </div>
                    <div className="text-sm mt-1">{apt.service_type}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            {view === 'month' && currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            {view === 'week' && `Semana de ${getWeekDays(currentDate)[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`}
            {view === 'day' && currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (view === 'month') navigateMonth(-1);
                else if (view === 'week') navigateWeek(-1);
                else navigateDay(-1);
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Hoje
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (view === 'month') navigateMonth(1);
                else if (view === 'week') navigateWeek(1);
                else navigateDay(1);
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {view === 'month' && renderMonthView()}
        {view === 'week' && (
          <div className="overflow-x-auto">
            {renderWeekView()}
          </div>
        )}
        {view === 'day' && renderDayView()}
      </CardContent>
    </Card>
  );
}