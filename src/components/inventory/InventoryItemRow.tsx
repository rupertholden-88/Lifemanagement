import { Tag } from '../shared/ui'
import { MinusIcon, PlusIcon, ExternalLinkIcon } from '../shared/icons'
import { getEffectiveLevel, STOCK_LEVEL_LABEL } from '../../lib/inventory'
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
    <div className="border-b-2 border-divider py-3.5">
      <div className="mb-2.5 flex items-center gap-2.5">
        <span className="min-w-0 flex-1 truncate font-heading text-[16px] font-semibold tracking-[-0.02em] text-ink">{item.name}</span>
        <Tag tone={lowStock ? 'accent' : 'neutral'}>{STOCK_LEVEL_LABEL[level]}</Tag>
      </div>
      {item.notes && <p className="mb-2 text-xs text-neutral-500">{item.notes}</p>}

      {item.trackingMode === 'quantity' ? (
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => onAdjustQuantity(-1)}
            aria-label={`Decrease ${item.name}`}
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-divider text-neutral-600 hover:bg-neutral-100"
          >
            <MinusIcon width={16} height={16} />
          </button>
          <span className="text-sm text-neutral-700">
            {item.quantity ?? 0} {item.unit}
          </span>
          <div className="flex-1" />
          <button
            onClick={() => onAdjustQuantity(1)}
            aria-label={`Increase ${item.name}`}
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-divider text-neutral-600 hover:bg-neutral-100"
          >
            <PlusIcon width={16} height={16} />
          </button>
        </div>
      ) : (
        <div className="flex gap-0.5 rounded-full bg-neutral-200 p-1">
          {STOCK_LEVELS.map((lvl) => (
            <button
              key={lvl}
              onClick={() => onSetLevel(lvl)}
              className={`min-h-10 flex-1 rounded-full px-2 font-heading text-[12.5px] font-semibold transition ${
                item.stockLevel === lvl ? 'bg-ink text-paper' : 'text-neutral-700'
              }`}
            >
              {STOCK_LEVEL_LABEL[lvl]}
            </button>
          ))}
        </div>
      )}

      <div className="mt-2.5 flex flex-wrap items-center gap-3">
        {lowStock && item.amazonUrl && (
          <a
            href={item.amazonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-accent-700"
          >
            Reorder on Amazon <ExternalLinkIcon width={11} height={11} />
          </a>
        )}
        <button onClick={onEdit} className="text-xs font-medium text-neutral-500 hover:text-ink">
          Edit
        </button>
        <button onClick={onDelete} className="ml-auto text-xs font-medium text-neutral-500 hover:text-accent-700">
          Remove
        </button>
      </div>
    </div>
  )
}
