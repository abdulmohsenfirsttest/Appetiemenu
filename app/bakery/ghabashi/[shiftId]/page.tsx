'use client'
import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { GHABASHI_TASKS, GhabashiTask } from '@/lib/ghabashi-tasks'

type Completion = { id: number; task_key: string; photo_url: string | null; completed_at: string }
type Shift = { id: number; staff_name: string; shift_type: 'morning' | 'closing'; date: string; status: string; ghabashi_task_completions: Completion[] }

export default function GhabashiTaskList() {
  const { shiftId } = useParams<{ shiftId: string }>()
  const router = useRouter()
  const [shift, setShift] = useState<Shift | null>(null)
  const [uploading, setUploading] = useState<string | null>(null)
  const [viewPhoto, setViewPhoto] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  async function load() {
    const res = await fetch(`/api/bakery/ghabashi/shifts/${shiftId}`)
    if (res.ok) setShift(await res.json())
  }

  useEffect(() => { load() }, [shiftId])

  if (!shift) return <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>Loading...</div>

  const tasks: GhabashiTask[] = GHABASHI_TASKS[shift.shift_type] || []
  const completions = shift.ghabashi_task_completions || []
  const doneKeys = new Set(completions.map(c => c.task_key))
  const doneCount = tasks.filter(t => doneKeys.has(t.key)).length
  const allDone = doneCount === tasks.length
  const shiftDone = shift.status === 'completed'

  async function handlePhoto(task: GhabashiTask, file: File) {
    setUploading(task.key)
    const fd = new FormData()
    fd.append('shift_id', String(shift!.id))
    fd.append('task_key', task.key)
    fd.append('task_name', task.name)
    fd.append('photo', file)
    await fetch('/api/bakery/ghabashi/complete', { method: 'POST', body: fd })
    await load()
    setUploading(null)
  }

  async function completeShift() {
    setSubmitting(true)
    await fetch(`/api/bakery/ghabashi/shifts/${shiftId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    })
    await load()
    setSubmitting(false)
  }

  const shiftColor = shift.shift_type === 'morning' ? '#92400e' : '#1e40af'
  const shiftBg = shift.shift_type === 'morning' ? '#fffbeb' : '#eff6ff'
  const shiftEmoji = shift.shift_type === 'morning' ? '🌅' : '🌙'

  return (
    <div style={{ maxWidth: 540, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.push('/bakery/ghabashi')} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13, color: '#475569' }}>← Back</button>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, color: '#2d1f14' }}>
            {shiftEmoji} {shift.shift_type === 'morning' ? 'Morning' : 'Closing'} Shift
          </div>
          <div style={{ fontSize: 12, color: '#7a6355' }}>{shift.staff_name} · {shift.date}</div>
        </div>
      </div>

      {/* Progress */}
      <div style={{ background: 'white', border: '1px solid #e8ddd0', borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#2d1f14' }}>Progress</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: shiftColor }}>{doneCount}/{tasks.length} tasks</span>
        </div>
        <div style={{ background: '#f1f5f9', borderRadius: 99, height: 8, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 99, background: shiftColor, width: `${(doneCount / tasks.length) * 100}%`, transition: 'width .4s' }} />
        </div>
      </div>

      {/* Task list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {tasks.map((task, i) => {
          const completion = completions.find(c => c.task_key === task.key)
          const done = !!completion
          const busy = uploading === task.key

          return (
            <div key={task.key} style={{
              background: done ? '#f0fdf4' : 'white',
              border: `1px solid ${done ? '#bbf7d0' : '#e8ddd0'}`,
              borderRadius: 14, padding: '16px 18px',
              display: 'flex', gap: 14, alignItems: 'flex-start',
            }}>
              {/* Number / check */}
              <div style={{
                minWidth: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? '#16a34a' : shiftBg, color: done ? 'white' : shiftColor,
                fontWeight: 800, fontSize: done ? 16 : 14, flexShrink: 0,
              }}>
                {done ? '✓' : i + 1}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#2d1f14' }}>{task.name}</div>
                <div style={{ fontSize: 12, color: '#7a6355', marginTop: 2, marginBottom: done || busy ? 10 : 0 }}>{task.desc}</div>

                {/* Photo thumbnail if done */}
                {done && completion?.photo_url && (
                  <button onClick={() => setViewPhoto(completion.photo_url!)} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}>
                    <img src={completion.photo_url} alt="task photo" style={{ width: '100%', maxHeight: 140, objectFit: 'cover', borderRadius: 8, border: '1px solid #bbf7d0' }} />
                  </button>
                )}

                {/* Upload button */}
                {!shiftDone && (
                  <>
                    <input
                      ref={el => { inputRefs.current[task.key] = el }}
                      type="file" accept="image/*" capture="environment"
                      style={{ display: 'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handlePhoto(task, f) }}
                    />
                    <button
                      onClick={() => inputRefs.current[task.key]?.click()}
                      disabled={busy}
                      style={{
                        marginTop: 8, padding: '7px 16px', borderRadius: 8, border: 'none', cursor: busy ? 'wait' : 'pointer',
                        background: done ? '#dcfce7' : shiftBg, color: done ? '#15803d' : shiftColor,
                        fontWeight: 700, fontSize: 12,
                      }}
                    >
                      {busy ? '⏳ Uploading...' : done ? '📷 Retake Photo' : '📷 Take Photo'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Submit button */}
      {!shiftDone ? (
        <button
          onClick={completeShift}
          disabled={!allDone || submitting}
          style={{
            width: '100%', padding: '16px', borderRadius: 14, border: 'none',
            background: allDone ? '#16a34a' : '#e2e8f0',
            color: allDone ? 'white' : '#94a3b8',
            fontWeight: 800, fontSize: 16, cursor: allDone ? 'pointer' : 'not-allowed',
          }}
        >
          {submitting ? 'Submitting...' : allDone ? '✅ Complete Shift' : `Complete all ${tasks.length - doneCount} remaining tasks first`}
        </button>
      ) : (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#15803d' }}>Shift Completed!</div>
          <div style={{ fontSize: 13, color: '#16a34a', marginTop: 4 }}>All tasks done. Great work!</div>
        </div>
      )}

      {/* Photo modal */}
      {viewPhoto && (
        <div onClick={() => setViewPhoto(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: 600, width: '100%' }}>
            <img src={viewPhoto} alt="task" style={{ width: '100%', borderRadius: 12, maxHeight: '80vh', objectFit: 'contain' }} />
            <button onClick={() => setViewPhoto(null)} style={{ position: 'absolute', top: -12, right: -12, background: 'white', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>✕</button>
          </div>
        </div>
      )}
    </div>
  )
}
