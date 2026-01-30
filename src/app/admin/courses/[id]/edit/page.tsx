'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Video } from 'lucide-react';

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [courseType, setCourseType] = useState<'RECORDED' | 'LIVE'>('RECORDED');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    thumbnail: '',
    // Recorded course fields
    validity: '6',
    modules: [{ name: '', order: 0, _id: undefined as string | undefined }],
    videos: [],
    // Live course fields
    duration: '',
    startDate: '',
    endDate: '',
    schedule: [{ dayOfWeek: 1, time: '18:00', meetingLink: '', isActive: true }],
  });

  // Fetch course data on mount
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/courses/${courseId}`);
        const data = await res.json();

        if (data.success) {
          const course = data.course;
          setCourseType(course.courseType);
          
          setFormData({
            name: course.name || '',
            description: course.description || '',
            price: course.price?.toString() || '',
            thumbnail: course.thumbnail || '',
            validity: course.validity?.toString() || '6',
            modules: course.modules?.length > 0 ? course.modules : [{ name: '', order: 0 }],
            videos: course.videos || [],
            duration: course.duration?.toString() || '',
            startDate: course.startDate ? course.startDate.split('T')[0] : '',
            endDate: course.endDate ? course.endDate.split('T')[0] : '',
            schedule: course.schedule?.length > 0 
              ? course.schedule 
              : [{ dayOfWeek: 1, time: '18:00', meetingLink: '', isActive: true }],
          });
        } else {
          alert('Course not found');
          router.push('/admin/courses');
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        alert('Failed to load course');
        router.push('/admin/courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

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
        payload.modules = formData.modules.map((m, i) => ({ 
          ...m, 
          order: i,
          _id: m._id || `m${i}` 
        }));
      } else {
        payload.duration = parseInt(formData.duration);
        payload.startDate = formData.startDate;
        payload.endDate = formData.endDate;
        payload.schedule = formData.schedule;
      }

      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        alert('Course updated successfully!');
        router.push('/admin/dashboard');
      } else {
        alert(data.error || 'Failed to update course');
      }
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  const addModule = () => {
    setFormData({
      ...formData,
      modules: [...formData.modules, { name: '', order: formData.modules.length, _id: undefined }],
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <nav className="container mx-auto px-6 py-4">
          <Link href="/admin/dashboard" className="text-2xl font-bold text-gradient">
            Galaxy Classes Admin
          </Link>
        </nav>
      </header>

      <div className="container mx-auto px-6 py-12">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-2 text-primary-600 hover:gap-3 transition-all mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>

        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Edit Course</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Course Type Display (Read-only) */}
            <div className="card p-6">
              <label className="label">Course Type</label>
              <div className="p-4 bg-gray-100 rounded-lg">
                <p className="font-bold text-lg">
                  {courseType === 'RECORDED' ? 'Pre-Recorded Course' : 'Live Course'}
                </p>
                <p className="text-sm text-gray-600">
                  {courseType === 'RECORDED' 
                    ? 'Video-based with 6-month validity' 
                    : 'Scheduled daily live classes'}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-2">Course type cannot be changed after creation</p>
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

              <div>
                <label className="label">Thumbnail URL (Optional)</label>
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  className="input"
                  placeholder="https://example.com/image.jpg"
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

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Next Step:</strong> Upload videos to your modules
                  </p>
                  <Link
                    href={`/admin/courses/${courseId}/videos`}
                    className="btn bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 w-fit"
                  >
                    <Video className="w-5 h-5" />
                    Manage Videos
                  </Link>
                </div>
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
              <Link href="/admin/dashboard" className="btn btn-outline">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
