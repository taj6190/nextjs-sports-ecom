"use client";

import { useState, useEffect } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import type { IAttribute } from "@/types";

export default function AdminAttributesPage() {
  const [attributes, setAttributes] = useState<IAttribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", type: "select" as "select" | "color" | "button", values: [] as string[] });
  const [valueInput, setValueInput] = useState("");

  const fetchAttributes = async () => {
    const res = await fetch("/api/attributes");
    const json = await res.json();
    if (json.success) setAttributes(json.data);
    setLoading(false);
  };

  useEffect(() => { fetchAttributes(); }, []);

  const addValue = () => {
    if (valueInput.trim() && !form.values.includes(valueInput.trim())) {
      setForm({ ...form, values: [...form.values, valueInput.trim()] });
      setValueInput("");
    }
  };

  const removeValue = (val: string) => {
    setForm({ ...form, values: form.values.filter((v) => v !== val) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { toast.error("Name is required"); return; }
    if (form.values.length === 0) { toast.error("Add at least one value"); return; }

    const method = editId ? "PUT" : "POST";
    const body = editId ? { _id: editId, ...form } : form;

    const res = await fetch("/api/attributes", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await res.json();
    if (json.success) {
      toast.success(editId ? "Attribute updated!" : "Attribute created!");
      setModalOpen(false);
      setEditId(null);
      setForm({ name: "", type: "select", values: [] });
      fetchAttributes();
    } else {
      toast.error(json.error || "Failed");
    }
  };

  const handleEdit = (attr: IAttribute) => {
    setEditId(attr._id);
    setForm({ name: attr.name, type: attr.type, values: attr.values });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this attribute?")) return;
    const res = await fetch(`/api/attributes?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) { toast.success("Deleted!"); fetchAttributes(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Attributes</h1>
          <p className="text-sm text-slate-500 mt-1">Define product attributes for variant generation</p>
        </div>
        <Button onClick={() => { setEditId(null); setForm({ name: "", type: "select", values: [] }); setModalOpen(true); }}>
          <FiPlus className="mr-2" size={16} /> Add Attribute
        </Button>
      </div>

      <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-4 px-5 text-slate-400 font-medium">Name</th>
                <th className="text-left py-4 px-5 text-slate-400 font-medium">Type</th>
                <th className="text-left py-4 px-5 text-slate-400 font-medium">Values</th>
                <th className="py-4 px-5" />
              </tr>
            </thead>
            <tbody>
              {attributes.map((attr) => (
                <tr key={attr._id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                  <td className="py-3 px-5 text-white font-medium">{attr.name}</td>
                  <td className="py-3 px-5 text-slate-400 capitalize">{attr.type}</td>
                  <td className="py-3 px-5">
                    <div className="flex flex-wrap gap-1">
                      {attr.values.map((val) => (
                        <span key={val} className="px-2 py-0.5 bg-slate-700/50 text-slate-300 text-xs rounded">
                          {val}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => handleEdit(attr)} className="p-2 text-slate-400 hover:text-blue-400 rounded-lg hover:bg-slate-800 cursor-pointer">
                        <FiEdit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(attr._id)} className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 cursor-pointer">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {attributes.length === 0 && (
                <tr><td colSpan={4} className="py-10 text-center text-slate-500">No attributes yet</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? "Edit Attribute" : "Add Attribute"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., RAM" required id="attr-name" />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as "select" | "color" | "button" })}
                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
              >
                <option value="select">Select</option>
                <option value="button">Button</option>
                <option value="color">Color</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Values</label>
            <div className="flex gap-2">
              <Input
                value={valueInput}
                onChange={(e) => setValueInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addValue())}
                placeholder="e.g., 8GB"
                id="attr-value-input"
              />
              <Button type="button" variant="secondary" onClick={addValue}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {form.values.map((val) => (
                <span key={val} className="flex items-center gap-1 px-3 py-1 bg-slate-800/50 text-slate-300 text-sm rounded-lg border border-slate-700">
                  {val}
                  <button type="button" onClick={() => removeValue(val)} className="text-slate-500 hover:text-red-400 cursor-pointer">
                    <FiX size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editId ? "Update" : "Create"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
