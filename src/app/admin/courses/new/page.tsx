'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

export default function NewCoursePage() {
  const router = useRouter();
  const [courseType, setCourseType] = useState<'RECORDED' | 'LIVE'>('RECORDED');
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    thumbnail: '',
    // Recorded course fields
    validity: '6',
    modules: [{ name: '', order: 0 }],
    videos: [],
    // Live course fields
    duration: '',
    startDate: '',
    endDate: '',
    schedule: [{ dayOfWeek: 1, time: '18:00', meetingLink: '', isActive: true }],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        thumbnail: formData.thumbnail,
        courseType,
      };

      if (courseType === 'RECORDED') {
        payload.validity = parseInt(formData.validity);
        payload.modules = formData.modules.map((m, i) => ({ ...m, order: i, _id: `m${i}` }));
        payload.videos = [];
      } else {
        payload.duration = parseInt(formData.duration);
        payload.startDate = formData.startDate;
        payload.endDate = formData.endDate;
        payload.schedule = formData.schedule;
      }

      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        alert('Course created successfully!');
        router.push('/admin/courses');
      } else {
        alert(data.error || 'Failed to create course');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const addModule = () => {
    setFormData({
      ...formData,
      modules: [...formData.modules, { name: '', order: formData.modules.length }],
    });
  };

  const removeModule = (index: number) => {
    setFormData({
      ...formData,
      modules: formData.modules.filter((_, i) => i !== index),
    });
  };

  const addScheduleSlot = () => {
    setFormData({
      ...formData,
      schedule: [...formData.schedule, { dayOfWeek: 1, time: '18:00', meetingLink: '', isActive: true }],
    });
  };

  const removeScheduleSlot = (index: number) => {
    setFormData({
      ...formData,
      schedule: formData.schedule.filter((_, i) => i !== index),
    });
  };

  const updateScheduleSlot = (index: number, field: string, value: any) => {
    const newSchedule = [...formData.schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setFormData({ ...formData, schedule: newSchedule });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <nav className="container mx-auto px-6 py-4">
          <Link href="/admin/dashboard" className="text-2xl font-bold text-gradient">
            ClassesAdmin
          </Link>
        </nav>
      </header>

      <div className="container mx-auto px-6 py-12">
        <Link
          href="/admin/courses"
          className="flex items-center gap-2 text-primary-600 hover:gap-3 transition-all mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Courses
        </Link>

        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Create New Course</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Course Type Selection */}
            <div className="card p-6">
              <label className="label">Course Type *</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setCourseType('RECORDED')}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    courseType === 'RECORDED'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-bold text-lg mb-2">Pre-Recorded Course</p>
                  <p className="text-sm text-gray-600">Video-based with 6-month validity</p>
                </button>

                <button
                  type="button"
                  onClick={() => setCourseType('LIVE')}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    courseType === 'LIVE'
                      ? 'border-secondary-600 bg-secondary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-bold text-lg mb-2">Live Course</p>
                  <p className="text-sm text-gray-600">Scheduled daily live classes</p>
                </button>
              </div>
            </div>

            {/* Basic Information */}
            <div className="card p-6 space-y-4">
              <h2 className="text-xl font-bold mb-4">Basic Information</h2>
              
              <div>
                <label className="label">Course Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="e.g., Complete Web Development"
                />
              </div>

              <div>
                <label className="label">Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows={4}
                  placeholder="Describe what students will learn..."
                />
              </div>

              <div>
                <label className="label">Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input"
                  placeholder="2999"
                />
              </div>
            </div>

            {/* Recorded Course Specific */}
            {courseType === 'RECORDED' && (
              <div className="card p-6 space-y-4">
                <h2 className="text-xl font-bold mb-4">Course Modules</h2>
                
                {formData.modules.map((module, index) => (
                  <div key={index} className="flex gap-4">
                    <input
                      type="text"
                      required
                      value={module.name}
                      onChange={(e) => {
                        const newModules = [...formData.modules];
                        newModules[index].name = e.target.value;
                        setFormData({ ...formData, modules: newModules });
                      }}
                      className="input flex-1"
                      placeholder="Module name"
                    />
                    {formData.modules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeModule(index)}
                        className="btn bg-red-500 text-white hover:bg-red-600"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addModule}
                  className="btn btn-outline flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Module
                </button>

                <p className="text-sm text-gray-600">
                  Note: You can upload videos to modules after creating the course
                </p>
              </div>
            )}

            {/* Live Course Specific */}
            {courseType === 'LIVE' && (
              <>
                <div className="card p-6 space-y-4">
                  <h2 className="text-xl font-bold mb-4">Course Duration</h2>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Duration (days) *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="input"
                        placeholder="90"
                      />
                    </div>

                    <div>
                      <label className="label">Start Date *</label>
                      <input
                        type="date"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="input"
                      />
                    </div>
                  </div>
                </div>

                <div className="card p-6 space-y-4">
                  <h2 className="text-xl font-bold mb-4">Weekly Schedule</h2>
                  
                  {formData.schedule.map((slot, index) => (
                    <div key={index} className="grid md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="label text-xs">Day *</label>
                        <select
                          required
                          value={slot.dayOfWeek}
                          onChange={(e) => updateScheduleSlot(index, 'dayOfWeek', parseInt(e.target.value))}
                          className="input"
                        >
                          <option value={0}>Sunday</option>
                          <option value={1}>Monday</option>
                          <option value={2}>Tuesday</option>
                          <option value={3}>Wednesday</option>
                          <option value={4}>Thursday</option>
                          <option value={5}>Friday</option>
                          <option value={6}>Saturday</option>
                        </select>
                      </div>

                      <div>
                        <label className="label text-xs">Time *</label>
                        <input
                          type="time"
                          required
                          value={slot.time}
                          onChange={(e) => updateScheduleSlot(index, 'time', e.target.value)}
                          className="input"
                        />
                      </div>

                      <div>
                        <label className="label text-xs">Meeting Link *</label>
                        <input
                          type="url"
                          required
                          value={slot.meetingLink}
                          onChange={(e) => updateScheduleSlot(index, 'meetingLink', e.target.value)}
                          className="input"
                          placeholder="https://zoom.us/..."
                        />
                      </div>

                      <div className="flex items-end">
                        {formData.schedule.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeScheduleSlot(index)}
                            className="btn bg-red-500 text-white hover:bg-red-600 w-full"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addScheduleSlot}
                    className="btn btn-outline flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Time Slot
                  </button>
                </div>
              </>
            )}

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <Link href="/admin/courses" className="btn btn-outline">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Course'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
