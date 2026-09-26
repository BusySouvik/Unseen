import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Scale,
  Package,
  Warehouse,
  Hash,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import AppShell from "../components/app/AppShell";
import { api } from "../lib/api";

export default function Adjustments() {
  const [products,setProducts]=useState([]);
  const [warehouses,setWarehouses]=useState([]);
  const [adjustments,setAdjustments]=useState([]);
  const [inventory,setInventory]=useState([]);

  const [productId,setProductId]=useState("");
  const [warehouseId,setWarehouseId]=useState("");
  const [countedQuantity,setCountedQuantity]=useState("");
  const [reason,setReason]=useState("");

  const [loading,setLoading]=useState(true);
  const [submitting,setSubmitting]=useState(false);
  const [showForm,setShowForm]=useState(false);
  const [message,setMessage]=useState(null);

  const loadData=async()=>{
    try{
      const [p,w,a,i]=await Promise.all([
        api.getProducts(),
        api.getWarehouses(),
        api.getAdjustments(),
        api.getInventory()
      ]);

      setProducts(p||[]);
      setWarehouses(w||[]);
      setAdjustments(a||[]);
      setInventory(i||[]);
    }catch(e){
      setMessage({
        type:"error",
        text:e.message||"Failed to load adjustments."
      });
    }finally{
      setLoading(false);
    }
  };

  useEffect(()=>{loadData()},[]);

  const selectedProduct=products.find(p=>p.id===productId);

  const currentQuantity=inventory
    .filter(
      i =>
        i.product_id===productId &&
        i.warehouse_id===warehouseId
    )
    .reduce((sum,i)=>sum+Number(i.quantity||0),0);

  const difference =
    countedQuantity === ""
      ? null
      : Number(countedQuantity)-currentQuantity;

  const submitAdjustment=async(e)=>{
    e.preventDefault();

    if(!productId||!warehouseId||countedQuantity===""||!reason){
      setMessage({
        type:"error",
        text:"Please fill all fields."
      });
      return;
    }

    if(Number(countedQuantity)<0){
      setMessage({
        type:"error",
        text:"Physical quantity cannot be negative."
      });
      return;
    }

    try{
      setSubmitting(true);
      setMessage(null);

      await api.createAdjustment({
        product_id:productId,
        warehouse_id:warehouseId,
        counted_quantity:Number(countedQuantity),
        reason
      });

      const diff=Number(countedQuantity)-currentQuantity;

      setMessage({
        type:"success",
        text:`Stock reconciled successfully. ${diff>0?"+":""}${diff} ${selectedProduct?.unit||""} adjustment applied.`
      });

      setProductId("");
      setWarehouseId("");
      setCountedQuantity("");
      setReason("");
      setShowForm(false);

      await loadData();
    }catch(e){
      setMessage({
        type:"error",
        text:e.message||"Failed to create adjustment."
      });
    }finally{
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="min-h-full px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1500px]">

          <motion.div
            initial={{opacity:0,y:18}}
            animate={{opacity:1,y:0}}
            className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"
          >
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
                <Scale size={14}/>
                Operations
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Inventory Adjustments
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Reconcile recorded stock with the actual physical count.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={loadData}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-300 hover:bg-white/[0.08]"
              >
                <RefreshCw size={15}/>
                Refresh
              </button>

              <button
                onClick={()=>setShowForm(true)}
                className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black hover:scale-[1.02]"
              >
                <Scale size={16}/>
                New Adjustment
              </button>
            </div>
          </motion.div>

          <AnimatePresence>
            {message&&(
              <motion.div
                initial={{opacity:0,y:-10}}
                animate={{opacity:1,y:0}}
                exit={{opacity:0,y:-10}}
                className={`mb-5 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
                  message.type==="success"
                  ?"border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                  :"border-red-400/20 bg-red-400/10 text-red-300"
                }`}
              >
                {message.type==="success"
                  ?<CheckCircle2 size={18}/>
                  :<AlertCircle size={18}/>}
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Explanation */}
          <div className="mb-6 grid gap-3 md:grid-cols-3">
            <InfoCard
              icon={<Package size={17}/>}
              title="Recorded"
              text="Current quantity stored in the system."
            />
            <InfoCard
              icon={<Scale size={17}/>}
              title="Physical Count"
              text="Actual quantity found during stock check."
            />
            <InfoCard
              icon={<TrendingUp size={17}/>}
              title="Difference"
              text="The system automatically calculates the adjustment."
            />
          </div>

          {/* History */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
            <div className="border-b border-white/10 px-5 py-4">
              <h2 className="font-semibold text-white">
                Adjustment History
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Stock reconciliation records
              </p>
            </div>

            {loading?(
              <div className="space-y-3 p-5">
                {[1,2,3,4].map(x=>(
                  <div
                    key={x}
                    className="h-16 animate-pulse rounded-xl bg-white/[0.04]"
                  />
                ))}
              </div>
            ):adjustments.length===0?(
              <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
                <div className="mb-4 rounded-2xl bg-white/[0.04] p-4">
                  <Scale className="text-slate-500"/>
                </div>

                <p className="font-semibold text-white">
                  No adjustments yet
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Reconcile your first physical stock count.
                </p>
              </div>
            ):(
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px]">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-4">Product</th>
                      <th className="px-5 py-4">Warehouse</th>
                      <th className="px-5 py-4">Recorded</th>
                      <th className="px-5 py-4">Physical</th>
                      <th className="px-5 py-4">Difference</th>
                      <th className="px-5 py-4">Reason</th>
                      <th className="px-5 py-4">Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {adjustments.map((adjustment,index)=>{
                      const difference=Number(adjustment.difference||0);

                      return(
                        <motion.tr
                          key={adjustment.id}
                          initial={{opacity:0,y:8}}
                          animate={{opacity:1,y:0}}
                          transition={{delay:index*.03}}
                          className="border-b border-white/[0.06] hover:bg-white/[0.03]"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="rounded-lg bg-amber-400/10 p-2 text-amber-300">
                                <Package size={15}/>
                              </div>

                              <div>
                                <div className="text-sm font-medium text-white">
                                  {adjustment.products?.name||"—"}
                                </div>
                                <div className="font-mono text-xs text-slate-600">
                                  {adjustment.products?.sku||""}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-400">
                            {adjustment.warehouses?.name||"—"}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-300">
                            {adjustment.previous_quantity}
                          </td>

                          <td className="px-5 py-4 text-sm font-semibold text-white">
                            {adjustment.counted_quantity}
                          </td>

                          <td className="px-5 py-4">
                            <Difference value={difference}/>
                          </td>

                          <td className="max-w-[220px] truncate px-5 py-4 text-sm text-slate-400">
                            {adjustment.reason}
                          </td>

                          <td className="px-5 py-4 text-xs text-slate-500">
                            {formatDate(adjustment.created_at)}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showForm&&(
          <motion.div
            initial={{opacity:0}}
            animate={{opacity:1}}
            exit={{opacity:0}}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
            onMouseDown={e=>{
              if(e.target===e.currentTarget)setShowForm(false);
            }}
          >
            <motion.div
              initial={{opacity:0,y:25,scale:.97}}
              animate={{opacity:1,y:0,scale:1}}
              exit={{opacity:0,y:15}}
              className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b0d11] p-6 shadow-2xl"
            >
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
                    <Scale size={19}/>
                  </div>

                  <h2 className="text-xl font-bold text-white">
                    New Inventory Adjustment
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Enter the actual physical quantity found.
                  </p>
                </div>

                <button
                  onClick={()=>setShowForm(false)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white"
                >
                  <X size={19}/>
                </button>
              </div>

              <form onSubmit={submitAdjustment} className="space-y-4">

                <Field label="Product" icon={<Package size={15}/>}>
                  <select
                    value={productId}
                    onChange={e=>{
                      setProductId(e.target.value);
                      setWarehouseId("");
                      setCountedQuantity("");
                    }}
                    className="input appearance-none"
                  >
                    <option value="">Select product</option>
                    {products.map(product=>(
                      <option key={product.id} value={product.id}>
                        {product.name} · {product.sku}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Warehouse" icon={<Warehouse size={15}/>}>
                  <select
                    value={warehouseId}
                    onChange={e=>{
                      setWarehouseId(e.target.value);
                      setCountedQuantity("");
                    }}
                    className="input appearance-none"
                  >
                    <option value="">Select warehouse</option>
                    {warehouses.map(w=>(
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </Field>

                {productId&&warehouseId&&(
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        System recorded quantity
                      </span>

                      <span className="text-lg font-bold text-white">
                        {currentQuantity} {selectedProduct?.unit}
                      </span>
                    </div>
                  </div>
                )}

                <Field
                  label={`Physical Quantity${selectedProduct?` (${selectedProduct.unit})`:""}`}
                  icon={<Hash size={15}/>}
                >
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={countedQuantity}
                    onChange={e=>setCountedQuantity(e.target.value)}
                    placeholder="Enter physical count"
                    className="input"
                  />
                </Field>

                {difference!==null&&(
                  <div className={`rounded-xl border p-4 ${
                    difference>0
                      ?"border-emerald-400/15 bg-emerald-400/[0.05]"
                      :difference<0
                      ?"border-red-400/15 bg-red-400/[0.05]"
                      :"border-white/10 bg-white/[0.03]"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-slate-500">
                          Adjustment Difference
                        </div>

                        <div className={`mt-1 text-xl font-bold ${
                          difference>0
                            ?"text-emerald-300"
                            :difference<0
                            ?"text-red-300"
                            :"text-slate-300"
                        }`}>
                          {difference>0?"+":""}
                          {difference} {selectedProduct?.unit}
                        </div>
                      </div>

                      {difference>0
                        ?<TrendingUp className="text-emerald-300"/>
                        :difference<0
                        ?<TrendingDown className="text-red-300"/>
                        :<Scale className="text-slate-500"/>
                      }
                    </div>
                  </div>
                )}

                <Field label="Reason" icon={<FileText size={15}/>}>
                  <textarea
                    value={reason}
                    onChange={e=>setReason(e.target.value)}
                    placeholder="e.g. Damaged items, physical count correction..."
                    rows={3}
                    className="input resize-none"
                  />
                </Field>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white font-semibold text-black hover:scale-[1.01] disabled:opacity-50"
                >
                  {submitting?(
                    <>
                      <RefreshCw size={16} className="animate-spin"/>
                      Reconciling...
                    </>
                  ):(
                    <>
                      <CheckCircle2 size={17}/>
                      Validate Adjustment
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

function Difference({value}){
  if(value>0){
    return(
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/15 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
        <TrendingUp size={13}/>
        +{value}
      </span>
    );
  }

  if(value<0){
    return(
      <span className="inline-flex items-center gap-1 rounded-full border border-red-400/15 bg-red-400/10 px-2.5 py-1 text-xs font-semibold text-red-300">
        <TrendingDown size={13}/>
        {value}
      </span>
    );
  }

  return(
    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-semibold text-slate-400">
      0
    </span>
  );
}

function Field({label,icon,children}){
  return(
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
        {icon}{label}
      </span>
      {children}
    </label>
  );
}

function InfoCard({icon,title,text}){
  return(
    <motion.div
      whileHover={{y:-2}}
      className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"
    >
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
        {icon}
      </div>
      <div className="font-semibold text-white">{title}</div>
      <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
    </motion.div>
  );
}

function formatDate(date){
  if(!date)return "—";

  return new Date(date).toLocaleString("en-IN",{
    day:"2-digit",
    month:"short",
    year:"numeric",
    hour:"2-digit",
    minute:"2-digit"
  });
}
