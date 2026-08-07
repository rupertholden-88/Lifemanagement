import { Badge } from '../shared/ui'
import { getEffectiveLevel, STOCK_LEVEL_COLOR, STOCK_LEVEL_LABEL } from '../../lib/inventory'
import type { InventoryItem, StockLevel } from '../../types'
import { STOCK_LEVELS } from '../../types'

interface InventoryItemRowProps {
  item: InventoryItem
  onAdjustQuantity: (delta: number) => void
  onSetLevel: (level: StockLevel) => void
  onEdit: () => void
  onDelete: () => void
}

export function InventoryItemRow({ item, onAdjustQuantity, onSetLevel, onEdit, onDelete }: InventoryItemRowProps) {
  const level = getEffectiveLevel(item)
  const lowStock = level === 'out' || level === 'low'

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-navy-900">{item.name}</p>
          <Badge className={STOCK_LEVEL_COLOR[level]}>{STOCK_LEVEL_LABEL[level]}</Badge>
        </div>
        {item.notes && <p className="mt-0.5 text-xs text-slate-400">{item.notes}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {item.trackingMode === 'quantity' ? (
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-1.5 py-1">
            <button
              onClick={() => onAdjustQuantity(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-lg text-slate-600 shadow-sm hover:bg-slate-50"
              aria-label={`Decrease ${item.name}`}
            >
              −
            </button>
            <span className="w-16 text-center text-sm font-medium text-navy-900">
              {item.quantity ?? 0} {item.unit}
            </span>
            <button
              onClick={() => onAdjustQuantity(1)}
              className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-lg text-slate-600 shadow-sm hover:bg-slate-50"
              aria-label={`Increase ${item.name}`}
            >
              +
            </button>
          </div>
        ) : (
          <div className="flex overflow-hidden rounded-lg border border-slate-200 text-xs font-medium">
            {STOCK_LEVELS.map((lvl) => (
              <button
                key={lvl}
                onClick={() => onSetLevel(lvl)}
                className={`min-h-10 px-3 py-2 transition ${
                  item.stockLevel === lvl ? 'bg-navy-900 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                {STOCK_LEVEL_LABEL[lvl]}
              </button>
            ))}
          </div>
        )}

        {lowStock && item.amazonUrl && (
          <a
            href={item.amazonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-10 items-center rounded-lg bg-orange-50 px-3 py-2 text-xs font-medium text-orange-700 hover:bg-orange-100"
          >
            Reorder on Amazon ↗
          </a>
        )}

        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={onEdit}
            className="min-h-10 rounded-md px-3 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="min-h-10 rounded-md px-3 text-xs font-medium text-slate-400 hover:bg-red-50 hover:text-red-600"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}
