(() => {
  const $ = (s) => document.querySelector(s);
  const client = () => window.saludSupabase;
  let user = null;
  const tables = {
    measures: { table: 'medidas_salud', list: '#measure-list', fields: ['fecha','peso','presion_sistolica','presion_diastolica','pulso','temperatura','notas'] },
    appointments: { table: 'citas', list: '#appointment-list', fields: ['fecha','hora','profesional','motivo','lugar','notas'] },
    medications: { table: 'medicamentos', list: '#medication-list', fields: ['nombre','dosis','frecuencia','hora','fecha_inicio','fecha_fin','notas'] },
    orders: { table: 'ordenes_salud', list: '#order-list', fields: ['nombre','tipo','fecha','estado','notas'] }
  };
  function message(text, error = false) { const n = $('#data-status'); n.textContent = text; n.className = 'mb-4 rounded-lg p-3 text-sm ' + (error ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'); n.classList.remove('hidden'); }
  function value(form, key) { const v = form.elements[key]?.value?.trim(); return v === '' || v === undefined ? null : v; }
  function safeText(value) { return value === null || value === undefined || value === '' ? '—' : String(value); }
  function addText(parent, text, className = '') { const el = document.createElement('span'); el.textContent = text; if (className) el.className = className; parent.appendChild(el); }
  function makeRecordCard(row, type) {
    const card = document.createElement('div'); card.className = 'border rounded-lg p-3 flex items-start justify-between gap-3';
    const body = document.createElement('div'); body.className = 'min-w-0';
    const fields = {
      measures: [['fecha','Fecha'],['peso','Peso (kg)'],['presion_sistolica','Sistólica'],['presion_diastolica','Diastólica'],['pulso','Pulso'],['temperatura','Temperatura'],['notas','Notas']],
      appointments: [['fecha','Fecha'],['hora','Hora'],['profesional','Profesional'],['motivo','Motivo'],['lugar','Lugar'],['notas','Notas']],
      medications: [['nombre','Medicamento'],['dosis','Dosis'],['frecuencia','Frecuencia'],['hora','Hora'],['fecha_inicio','Inicio'],['fecha_fin','Fin'],['notas','Notas']],
      orders: [['nombre','Orden'],['tipo','Tipo'],['fecha','Fecha'],['estado','Estado'],['notas','Notas']]
    }[type];
    const title = document.createElement('strong'); title.className = 'block text-slate-900'; title.textContent = safeText(row[fields[0][0]]); body.appendChild(title);
    const detail = document.createElement('p'); detail.className = 'text-slate-600 mt-1 break-words';
    detail.textContent = fields.slice(1).map(([key,label]) => row[key] != null && row[key] !== '' ? `${label}: ${row[key]}` : '').filter(Boolean).join(' · ') || 'Sin detalles adicionales'; body.appendChild(detail);
    const del = document.createElement('button'); del.type = 'button'; del.textContent = 'Eliminar'; del.className = 'shrink-0 text-xs text-red-700 underline';
    del.addEventListener('click', async () => { if (!confirm('¿Eliminar este registro? Esta acción no se puede deshacer.')) return; const { error } = await client().from(tables[type].table).delete().eq('id', row.id).eq('usuario_id', user.id); if (error) message('No se pudo eliminar: ' + error.message, true); else { message('Registro eliminado.'); await loadList(type); } });
    card.append(body, del); return card;
  }
  async function loadList(type) {
    const cfg = tables[type]; const node = $(cfg.list); node.replaceChildren();
    const orderColumn = type === 'medications' ? 'fecha_inicio' : 'fecha';
    let query = client().from(cfg.table).select('*').order(orderColumn, { ascending: false, nullsFirst: false }).limit(30);
    const { data, error } = await query;
    if (error) { node.textContent = 'No se pudieron cargar los registros. ' + error.message; return; }
    if (!data?.length) { node.textContent = 'Todavía no tienes registros.'; node.className = 'space-y-2 text-sm text-slate-500'; return; }
    node.className = 'space-y-2 text-sm'; data.forEach(row => node.appendChild(makeRecordCard(row, type)));
  }
  async function insertFromForm(formId, type, fields, custom = {}) {
    const form = $(formId); form.addEventListener('submit', async e => {
      e.preventDefault(); const btn = form.querySelector('button[type=submit],button:not([type])'); if (btn) btn.disabled = true;
      const payload = { usuario_id: user.id };
      fields.forEach(k => { payload[k] = value(form, k); });
      Object.assign(payload, custom(form));
      if (type === 'measures') ['peso','presion_sistolica','presion_diastolica','pulso','temperatura'].forEach(k => { if (payload[k] !== null) payload[k] = Number(payload[k]); });
      const { error } = await client().from(tables[type].table).insert(payload);
      if (btn) btn.disabled = false;
      if (error) { message('No se pudo guardar. ' + error.message, true); return; }
      form.reset(); if (form.elements.fecha) form.elements.fecha.value = new Date().toLocaleDateString('en-CA');
      message('Registro guardado y sincronizado con tu cuenta.'); await loadList(type);
    });
  }
  async function loadProfile() {
    const { data, error } = await client().from('perfiles').select('*').eq('id', user.id).maybeSingle();
    if (error) { message('No se pudo cargar el perfil: ' + error.message, true); return; }
    const form = $('#profile-form'); if (data) ['nombre','eps','contacto_emergencia','telefono_emergencia'].forEach(k => { if (form.elements[k]) form.elements[k].value = data[k] || ''; });
    form.addEventListener('submit', async e => { e.preventDefault(); const btn = form.querySelector('button'); btn.disabled = true;
      const payload = { id: user.id, nombre: value(form,'nombre'), eps: value(form,'eps'), contacto_emergencia: value(form,'contacto_emergencia'), telefono_emergencia: value(form,'telefono_emergencia'), actualizado_en: new Date().toISOString() };
      const { error: saveError } = await client().from('perfiles').upsert(payload, { onConflict: 'id' }); btn.disabled = false;
      if (saveError) message('No se pudo guardar el perfil: ' + saveError.message, true); else message('Perfil guardado.');
    });
  }
  document.addEventListener('salud:ready', async (e) => {
    user = e.detail.user;
    const today = new Date().toLocaleDateString('en-CA');
    ['#measure-form','#appointment-form','#order-form'].forEach(id => { const f=$(id); if(f?.elements.fecha) f.elements.fecha.value=today; });
    await Promise.all([loadProfile(), loadList('measures'), loadList('appointments'), loadList('medications'), loadList('orders')]);
    insertFromForm('#measure-form','measures',tables.measures.fields);
    insertFromForm('#appointment-form','appointments',tables.appointments.fields, f => ({ estado: 'Programada' }));
    insertFromForm('#medication-form','medications',tables.medications.fields, f => ({ activo: true }));
    insertFromForm('#order-form','orders',tables.orders.fields);
  });
})();
