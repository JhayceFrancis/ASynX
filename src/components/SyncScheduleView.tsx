import React, { useState } from 'react';
import { AppSettings } from '../types';
import { Calendar, Clock, RotateCw, Server, Move, Save, Zap } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ScheduleTask {
  id: string;
  name: string;
  platform: 'plex' | 'simkl' | 'anilist' | 'mal' | 'matrix';
  timeHr: number; // 0 - 23
  frequency: 'daily' | 'weekly' | 'hourly';
}

interface SyncScheduleViewProps {
  settings?: AppSettings;
  onSaveSettings?: (settings: AppSettings) => void;
}

const SortableTask = ({ task }: { task: ScheduleTask }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-800 rounded-xl p-4 flex items-center justify-between shadow-sm mb-3 group">
      <div className="flex items-center space-x-4">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 dark:text-gray-600 hover:text-indigo-500 transition p-1">
          <Move className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
            <span>{task.name}</span>
            <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 rounded">
              {task.frequency}
            </span>
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Scheduled for {task.timeHr.toString().padStart(2, '0')}:00 {task.timeHr >= 12 ? 'PM' : 'AM'}</span>
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
         <select
            value={task.timeHr}
            onChange={() => {}} // Controlled by drag mostly, but can add select logic if needed
            className="text-xs bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-lg px-2 py-1 text-gray-700 dark:text-gray-300 focus:outline-none"
         >
           {Array.from({length: 24}).map((_, i) => (
             <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
           ))}
         </select>
      </div>
    </div>
  );
};

export const SyncScheduleView: React.FC<SyncScheduleViewProps> = ({ settings, onSaveSettings }) => {
  const [tasks, setTasks] = useState<ScheduleTask[]>([
    { id: 'task-1', name: 'Full Matrix Synchronization', platform: 'matrix', timeHr: 2, frequency: 'daily' },
    { id: 'task-2', name: 'Plex Watch History Scrape', platform: 'plex', timeHr: 4, frequency: 'hourly' },
    { id: 'task-3', name: 'Simkl <-> AniList Reconciliation', platform: 'anilist', timeHr: 18, frequency: 'daily' }
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        
        // Let's swap the times based on the new position to simulate drag-to-schedule
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Re-assign times based on order to simulate timeline
        return newItems.map((item, idx) => ({
          ...item,
          timeHr: (idx * 4 + 2) % 24
        }));
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-200 dark:border-neutral-900 pb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-indigo-500" />
            <span>Sync Schedule & Automations</span>
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Drag and drop tasks to adjust their execution timeline and frequency.
          </p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition flex items-center space-x-2 shadow-sm">
          <Save className="w-4 h-4" />
          <span>Save Schedule</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8">
          <div className="bg-gray-50/50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 p-6 rounded-3xl relative">
            <div className="absolute left-[38px] top-6 bottom-6 w-px bg-gray-300 dark:bg-neutral-800 z-0 hidden sm:block"></div>
            
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4 relative z-10">
                  {tasks.map((task) => (
                    <SortableTask key={task.id} task={task} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>

        <div className="md:col-span-4 space-y-6">
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
             <div className="flex items-center space-x-2 mb-3">
               <Zap className="w-5 h-5 text-amber-500" />
               <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Next Execution</h3>
             </div>
             <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
               The next automated matrix sweep will run in approx <span className="font-bold text-indigo-500">1h 45m</span>.
             </p>
          </div>

          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
             <div className="flex items-center space-x-2 mb-3">
               <Server className="w-5 h-5 text-emerald-500" />
               <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Daemon Status</h3>
             </div>
             <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 px-3 py-2 rounded-lg">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               <span>Local Background Worker Active</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
