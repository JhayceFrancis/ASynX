import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortablePanelProps {
  id: string;
  className?: string;
  children: React.ReactNode;
  isEditMode: boolean;
}

export const SortablePanel: React.FC<SortablePanelProps> = ({ id, className = '', children, isEditMode }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isEditMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`${className} flex`}>
      <div className="w-full flex-1 relative group">
        {/* We expose a specific drag handle area via data attribute if needed, but for now we'll just let the children render it and attach listeners to the handle manually or let the whole card be draggable if we attach listeners to the outer div. 
        Wait, we want a specific drag handle inside the children. We can pass listeners via a context or cloneElement, but since we are wrapping the whole component, we can just attach listeners to a wrapper div that acts as the handle. 
        Actually, we can pass `listeners` and `attributes` using Context, or just wrap the children and inject a drag handle.
        Let's provide a drag handle overlay when in edit mode that covers the top right corner, or just inject a standard handle if one isn't provided. 
        */}
        {children}
        
        {isEditMode && (
          <div 
            {...attributes} 
            {...listeners} 
            className="absolute top-2 right-12 z-50 p-1 rounded bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing hover:bg-black/80 flex items-center justify-center border border-white/10"
            title="Drag to Reorder"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="12" r="1"></circle>
              <circle cx="9" cy="5" r="1"></circle>
              <circle cx="9" cy="19" r="1"></circle>
              <circle cx="15" cy="12" r="1"></circle>
              <circle cx="15" cy="5" r="1"></circle>
              <circle cx="15" cy="19" r="1"></circle>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};
