import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeftRight,
  Package,
  Warehouse,
  Hash,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  ArrowRight,
  Boxes,
} from "lucide-react";
import AppShell from "../components/app/AppShell";
import { api } from "../lib/api";

export default function Transfers() {
  const [products,setProducts]=useState([]);
  const [warehouses,setWarehouses]=useState([]);
  const [transfers,setTransfers]=useState([]);
  const [inventory,setInventory]=useState([]);

  const [productId,setProductId]=useState("");
  const [fromWarehouse,setFromWarehouse]=useState("");
  const [toWarehouse,setToWarehouse]=useState("");
  const [quantity,setQuantity]=useState("");

  const [loading,setLoading]=useState(true);
  const [submitting,setSubmitting]=useState(false);
  const [showForm,setShowForm]=useState(false);
  const [message,setMessage]=useState(null);

  const loadData=async()=>{
    try{
      const [p,w,t,i]=await Promise.all([
        api.getProducts(),
        api.getWarehouses(),
        api.getTransfers(),
        api.getInventory()
      ]);

      setProducts(p||[]);
      setWarehouses(w||[]);
      setTransfers(t||[]);
      setInventory(i||[]);
    }catch(e){
      setMessage({
        type:"error",
        text:e.message||"Failed to load transfers."
      });
    }finally{
      setLoading(false);
    }
  };

  useEffect(()=>{loadData()},[]);

  const selectedProduct=products.find(p=>p.id===productId);

  const availableStock=inventory
    .filter(
      i =>
        i.product_id===productId &&
        i.warehouse_id===fromWarehouse
    )
    .reduce((sum,i)=>sum+Number(i.quantity||0),0);

  const submitTransfer=async(e)=>{
    e.preventDefault();

    if(!productId||!fromWarehouse||!toWarehouse||!quantity){
      setMessage({
        type:"error",
        text:"Please fill all fields."
      });
      return;
    }

    if(fromWarehouse===toWarehouse){
      setMessage({
        type:"error",
        text:"Source and destination warehouses must be different."
      });
      return;
    }

    if(Number(quantity)>availableStock){
      setMessage({
        type:"error",
        text:`Insufficient stock. Available: ${availableStock} ${selectedProduct?.unit||""}.`
      });
      return;
    }

    try{
      setSubmitting(true);
      setMessage(null);

      await api.createTransfer({
        product_id:productId,
        from_warehouse_id:fromWarehouse,
        to_warehouse_id:toWarehouse,
        quantity:Number(quantity)
      });

      setMessage({
        type:"success",
        text:`${quantity} ${selectedProduct?.unit||""} transferred successfully.`
      });

      setProductId("");
      setFromWarehouse("");
      setToWarehouse("");
      setQuantity("");
      setShowForm(false);

      await loadData();
    }catch(e){
      setMessage({
        type:"error",
        text:e.message||"Failed to transfer stock."
      });
    }finally{
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="min-h-full px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1500px]">

          {/* Header */}
          <motion.div
            initial={{opacity:0,y:18}}
            animate={{opacity:1,y:0}}
            className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"
          >
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
                <ArrowLeftRight size={14}/>
                Operations
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Internal Transfers
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Move inventory between warehouses and locations without changing total stock.
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
                <ArrowLeftRight size={16}/>
                New Transfer
              </button>
            </div>
          </motion.div>

          {/* Message */}
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

          {/* Flow */}
          <div className="mb-6 grid gap-3 md:grid-cols-3">
            <FlowCard
              number="01"
              title="Select"
              text="Choose the product and source warehouse."
            />
            <FlowCard
              number="02"
              title="Move"
              text="Choose destination and transfer quantity."
            />
            <FlowCard
              number="03"
              title="Ledger"
              text="Both warehouse movements are recorded."
            />
          </div>

          {/* History */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
            <div className="border-b border-white/10 px-5 py-4">
              <h2 className="font-semibold text-white">
                Transfer History
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Internal stock movements
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
            ):transfers.length===0?(
              <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
                <div className="mb-4 rounded-2xl bg-white/[0.04] p-4">
                  <ArrowLeftRight className="text-slate-500"/>
                </div>

                <p className="font-semibold text-white">
                  No transfers yet
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Move inventory between your warehouses.
                </p>
              </div>
            ):(
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-4">Product</th>
                      <th className="px-5 py-4">From</th>
                      <th className="px-5 py-4"></th>
                      <th className="px-5 py-4">To</th>
                      <th className="px-5 py-4">Quantity</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {transfers.map((transfer,index)=>(
                      <motion.tr
                        key={transfer.id}
                        initial={{opacity:0,y:8}}
                        animate={{opacity:1,y:0}}
                        transition={{delay:index*.03}}
                        className="border-b border-white/[0.06] hover:bg-white/[0.03]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-violet-400/10 p-2 text-violet-300">
                              <Package size={15}/>
                            </div>

                            <div>
                              <div className="text-sm font-medium text-white">
                                {transfer.products?.name||"—"}
                              </div>
                              <div className="font-mono text-xs text-slate-600">
                                {transfer.products?.sku||""}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-400">
                          {transfer.from_warehouse?.name||"—"}
                        </td>

                        <td className="px-5 py-4">
                          <ArrowRight
                            size={16}
                            className="text-violet-400"
                          />
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-400">
                          {transfer.to_warehouse?.name||"—"}
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-semibold text-white">
                            {transfer.quantity}
                          </span>
                          <span className="ml-1 text-xs text-slate-500">
                            {transfer.products?.unit||""}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                            <CheckCircle2 size={13}/>
                            {transfer.status}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-xs text-slate-500">
                          {formatDate(transfer.created_at)}
                        </td>
                      </motion.tr>
                    ))}
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
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
                    <ArrowLeftRight size={19}/>
                  </div>

                  <h2 className="text-xl font-bold text-white">
                    New Internal Transfer
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Move stock between warehouses.
                  </p>
                </div>

                <button
                  onClick={()=>setShowForm(false)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white"
                >
                  <X size={19}/>
                </button>
              </div>

              <form onSubmit={submitTransfer} className="space-y-4">

                <Field label="Product" icon={<Package size={15}/>}>
                  <select
                    value={productId}
                    onChange={e=>{
                      setProductId(e.target.value);
                      setQuantity("");
                      setFromWarehouse("");
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

                <Field label="From Warehouse" icon={<Warehouse size={15}/>}>
                  <select
                    value={fromWarehouse}
                    onChange={e=>{
                      setFromWarehouse(e.target.value);
                      setQuantity("");
                    }}
                    className="input appearance-none"
                  >
                    <option value="">Select source</option>
                    {warehouses.map(w=>(
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </Field>

                {productId&&fromWarehouse&&(
                  <div className="rounded-xl border border-violet-400/10 bg-violet-400/[0.04] px-4 py-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Available at source
                      </span>
                      <span className="font-semibold text-violet-300">
                        {availableStock} {selectedProduct?.unit}
                      </span>
                    </div>
                  </div>
                )}

                <Field label="To Warehouse" icon={<Warehouse size={15}/>}>
                  <select
                    value={toWarehouse}
                    onChange={e=>setToWarehouse(e.target.value)}
                    className="input appearance-none"
                  >
                    <option value="">Select destination</option>
                    {warehouses
                      .filter(w=>w.id!==fromWarehouse)
                      .map(w=>(
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                  </select>
                </Field>

                <Field
                  label={`Quantity${selectedProduct?` (${selectedProduct.unit})`:""}`}
                  icon={<Hash size={15}/>}
                >
                  <input
                    type="number"
                    min="0.01"
                    max={availableStock||undefined}
                    step="0.01"
                    value={quantity}
                    onChange={e=>setQuantity(e.target.value)}
                    placeholder="Enter quantity"
                    className="input"
                  />
                </Field>

                {fromWarehouse&&toWarehouse&&quantity&&(
                  <div className="flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs">
                    <span className="text-slate-400">
                      {warehouses.find(w=>w.id===fromWarehouse)?.name}
                    </span>

                    <ArrowRight
                      size={15}
                      className="text-violet-400"
                    />

                    <span className="text-slate-300">
                      {warehouses.find(w=>w.id===toWarehouse)?.name}
                    </span>

                    <span className="ml-auto font-semibold text-violet-300">
                      {quantity} {selectedProduct?.unit}
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white font-semibold text-black hover:scale-[1.01] disabled:opacity-50"
                >
                  {submitting?(
                    <>
                      <RefreshCw size={16} className="animate-spin"/>
                      Transferring...
                    </>
                  ):(
                    <>
                      <CheckCircle2 size={17}/>
                      Validate Transfer
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

function FlowCard({number,title,text}){
  return(
    <motion.div
      whileHover={{y:-2}}
      className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"
    >
      <div className="mb-2 flex items-center gap-3">
        <span className="font-mono text-xs text-violet-400">{number}</span>
        <span className="font-semibold text-white">{title}</span>
      </div>
      <p className="text-xs leading-5 text-slate-500">{text}</p>
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
