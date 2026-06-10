"use client";

import { Plus, Loader2 } from "lucide-react";

export default function PincodeForm({
  pincode,
  setPincode,
  city,
  setCity,
  state,
  setState,
  deliveryDays,
  setDeliveryDays,
  note,
  setNote,
  handleAdd,
  adding,
}) {
  return (
    <>
      
        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
                            <Plus size={16} className="text-blue-600" />
                          </div>
                          <h2 className="text-sm font-bold text-gray-900">Add Pincode</h2>
                        </div>

      <form onSubmit={handleAdd} className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
            Pincode *
          </label>

          <input
            type="text"
            value={pincode}
            onChange={(e) =>
              setPincode(
                e.target.value
                  .replace(/\D/g, "")
                  .slice(0, 6)
              )
            }
            placeholder="401209"
            maxLength={6}
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
              City
            </label>

            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Mumbai"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
              State
            </label>

            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="Maharashtra"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
            Delivery Days
          </label>

          <select
            value={deliveryDays}
            onChange={(e) =>
              setDeliveryDays(e.target.value)
            }
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
          >
            {[1, 2, 3, 4, 5, 7].map((d) => (
              <option key={d} value={d}>
                {d} Day{d > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
            Note
          </label>

          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="COD not available"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
          />
        </div>

        <button
          type="submit"
          disabled={adding}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl"
        >
          {adding ? (
            <Loader2
              size={15}
              className="animate-spin"
            />
          ) : (
            <Plus size={15} />
          )}

          {adding ? "Adding..." : "Add Pincode"}
        </button>
      </form>
      
    </>
  );
}