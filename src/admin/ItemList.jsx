import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Icon from '../components/Icon'
import { useSite } from '../context/SiteContext'
import { Confirm } from './ui'

function Row({ item, schema, table, onToggle, onDelete }) {
  const { settings } = useSite()
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const thumb = schema.thumb?.(item)

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-2xl border-2 bg-surface ${isDragging ? 'z-10 border-oak shadow-lift' : 'border-line'} ${item.visible ? '' : 'opacity-70'}`}
    >
      <div className="flex items-center gap-2 p-2">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={`Déplacer ${schema.title(item)}`}
          className="grid h-14 w-10 shrink-0 cursor-grab touch-none place-items-center rounded-lg text-muted active:cursor-grabbing"
        >
          <Icon name="grip" size={26} strokeWidth={3} />
        </button>
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-sand">
          {thumb ? <img src={thumb.thumb || thumb.src} alt="" className="h-full w-full object-cover" /> : <Icon name={schema.iconOf?.(item) || schema.icon} size={28} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{schema.title(item)}</p>
          <p className="truncate text-sm text-muted">{schema.subtitle(item, settings)}</p>
          {!item.visible && <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-bold uppercase text-[#B3392B]"><Icon name="eyeOff" size={14} /> Caché</p>}
        </div>
      </div>
      <div className="grid grid-cols-3 border-t-2 border-line text-sm font-semibold">
        <Link to={`/admin/${table}/${item.id}`} className="flex min-h-[52px] items-center justify-center gap-1.5 hover:bg-oak/10">
          <Icon name="edit" size={18} /> Modifier
        </Link>
        <button type="button" onClick={() => onToggle(item)} className="flex min-h-[52px] items-center justify-center gap-1.5 border-x-2 border-line hover:bg-oak/10">
          <Icon name={item.visible ? 'eyeOff' : 'eye'} size={18} /> {item.visible ? 'Masquer' : 'Afficher'}
        </button>
        <button type="button" onClick={() => onDelete(item)} className="flex min-h-[52px] items-center justify-center gap-1.5 text-[#B3392B] hover:bg-[#B3392B]/10">
          <Icon name="trash" size={18} /> Supprimer
        </button>
      </div>
    </li>
  )
}

/** Liste triable par glisser-déposer (doigt, souris ou clavier) */
export default function ItemList({ items, schema, table, onReorder, onToggle, onDelete }) {
  const [toDelete, setToDelete] = useState(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    const from = items.findIndex((i) => i.id === active.id)
    const to = items.findIndex((i) => i.id === over.id)
    onReorder(arrayMove(items, from, to))
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <ul className="space-y-3">
            {items.map((item) => (
              <Row key={item.id} item={item} schema={schema} table={table} onToggle={onToggle} onDelete={setToDelete} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {toDelete && (
        <Confirm
          title={`Supprimer « ${schema.title(toDelete)} » ?`}
          text="Cette action est définitive. Pour la retirer temporairement du site, utilisez plutôt « Masquer »."
          onCancel={() => setToDelete(null)}
          onConfirm={() => {
            onDelete(toDelete)
            setToDelete(null)
          }}
        />
      )}
    </>
  )
}
