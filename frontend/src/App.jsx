import { useEffect, useState } from 'react'

const yn = [['0', 'No'], ['1', 'Yes']]
const SECTIONS = [
  { title: 'Patient Information', icon: '👤', fields: [
    { n: 'age', l: 'Age', u: 'years', t: 'number', min: 1, max: 120 },
    { n: 'sex', l: 'Sex', o: [['1', 'Male'], ['0', 'Female']] } ] },
  { title: 'Vitals & Blood Tests', icon: '🩸', fields: [
    { n: 'trestbps', l: 'Resting Blood Pressure', u: 'mm Hg', t: 'number', min: 60, max: 250 },
    { n: 'chol', l: 'Cholesterol', u: 'mg/dl', t: 'number', min: 80, max: 700 },
    { n: 'fbs', l: 'Fasting Blood Sugar > 120 mg/dl', o: yn },
    { n: 'thalach', l: 'Max Heart Rate Achieved', u: 'bpm', t: 'number', min: 40, max: 230 } ] },
  { title: 'Cardiac Examination', icon: '🫀', fields: [
    { n: 'cp', l: 'Chest Pain Type', o: [['0', '0 – Typical angina'], ['1', '1 – Atypical angina'], ['2', '2 – Non-anginal pain'], ['3', '3 – Asymptomatic']] },
    { n: 'restecg', l: 'Resting ECG', o: [['0', '0 – Normal'], ['1', '1 – ST-T abnormality'], ['2', '2 – LV hypertrophy']] },
    { n: 'exang', l: 'Exercise Induced Angina', o: yn },
    { n: 'oldpeak', l: 'ST Depression (Oldpeak)', t: 'number', step: 0.1, min: 0, max: 10 },
    { n: 'slope', l: 'Slope of ST Segment', o: [['0', '0 – Downsloping'], ['1', '1 – Flat'], ['2', '2 – Upsloping']] },
    { n: 'ca', l: 'Major Vessels (0–4)', o: ['0', '1', '2', '3', '4'].map(v => [v, v]) },
    { n: 'thal', l: 'Thalassemia', o: [['1', '1 – Fixed defect'], ['2', '2 – Normal'], ['3', '3 – Reversible defect'], ['0', '0 – Unknown']] } ] },
]
const DEFAULTS = { age: 54, sex: '1', trestbps: 130, chol: 240, fbs: '0', thalach: 150, cp: '0', restecg: '0', exang: '0', oldpeak: 1.0, slope: '1', ca: '0', thal: '2' }

function Gauge({ value, bad }) {
  const r = 52, c = 2 * Math.PI * r
  return (
    <svg viewBox="0 0 120 120" className="gauge">
      <circle cx="60" cy="60" r={r} className="g-bg" />
      <circle cx="60" cy="60" r={r} className={'g-fg ' + (bad ? 'bad' : 'good')}
        strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} transform="rotate(-90 60 60)" />
      <text x="60" y="66" textAnchor="middle" className="g-txt">{value}%</text>
    </svg>
  )
}

export default function App() {
  const [form, setForm] = useState(DEFAULTS)
  const [res, setRes] = useState(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [model, setModel] = useState('')

  useEffect(() => { fetch('/info').then(r => r.json()).then(d => setModel(d.model)).catch(() => {}) }, [])
  const set = (n, v) => setForm(f => ({ ...f, [n]: v }))

  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr('')
    try {
      const r = await fetch('/predict', { method: 'POST', body: new URLSearchParams(form) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Something went wrong')
      setRes(d)
      setTimeout(() => document.getElementById('result')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50)
    } catch (x) { setErr(x.message) }
    setBusy(false)
  }

  return (
    <>
      <nav className="nav"><div className="wrap"><span className="logo">❤️ CardioCheck</span>{model && <span className="chip">Model: {model}</span>}</div></nav>
      <header className="hero"><div className="wrap">
        <h1>Heart Disease Risk Prediction</h1>
        <p>Enter the patient's clinical details to get an instant, machine-learning based risk assessment.</p>
      </div></header>

      <main className="wrap main">
        <form onSubmit={submit}>
          {SECTIONS.map(s => (
            <section className="card" key={s.title}>
              <h2><span className="ico">{s.icon}</span>{s.title}</h2>
              <div className="grid">
                {s.fields.map(f => (
                  <label className="field" key={f.n}>
                    <span>{f.l}{f.u && <em> ({f.u})</em>}</span>
                    {f.o
                      ? <select value={form[f.n]} onChange={e => set(f.n, e.target.value)}>{f.o.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select>
                      : <input type="number" required value={form[f.n]} min={f.min} max={f.max} step={f.step || 1} onChange={e => set(f.n, e.target.value)} />}
                  </label>
                ))}
              </div>
            </section>
          ))}
          {err && <div className="alert">⚠️ {err}</div>}
          <button className="btn" disabled={busy}>{busy ? 'Analyzing…' : 'Analyze Risk'}</button>
        </form>

        {res && (
          <section id="result" className={'card result ' + (res.disease ? 'bad' : 'good')}>
            <Gauge value={res.probability} bad={res.disease} />
            <div>
              <span className={'badge ' + (res.disease ? 'bad' : 'good')}>{res.level} Risk</span>
              <h2>{res.disease ? 'Signs of heart disease detected' : 'Low likelihood of heart disease'}</h2>
              <p>Estimated probability of heart disease: <b>{res.probability}%</b>. {res.disease ? 'Please consult a cardiologist for proper evaluation.' : 'Keep up regular check-ups and a healthy lifestyle.'}</p>
            </div>
          </section>
        )}
        <p className="note">⚠️ Educational machine-learning project. This tool does not replace professional medical diagnosis. It only predicts heart disease, not other conditions.</p>
      </main>
      <footer className="foot">© CardioCheck · Built with React & Flask</footer>
    </>
  )
}