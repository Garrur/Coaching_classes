'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, Trash2, Plus, Video, Save } from 'lucide-react';

interface Module {
  _id: string;
  name: string;
  order: number;
}

interface VideoItem {
  _id?: string;
  title: string;
  url: string;
  duration?: number;
  order: number;
  moduleId: string;
}

export default function ManageVideosPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [courseName, setCourseName] = useState('');
  const [modules, setModules] = useState<Module[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>('');
  
  // New video form
  const [newVideo, setNewVideo] = useState({
    title: '',
    file: null as File | null,
  });

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      const data = await res.json();

      if (data.success) {
        setCourseName(data.course.name);
        setModules(data.course.modules || []);
        setVideos(data.course.videos || []);
        if (data.course.modules?.length > 0) {
          setSelectedModule(data.course.modules[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewVideo({ ...newVideo, file });
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newVideo.file || !newVideo.title || !selectedModule) {
      alert('Please fill all fields and select a module');
      return;
    }

    setUploading(true);

    try {
      // Upload video file
      const formData = new FormData();
      formData.append('video', newVideo.file);

      const uploadRes = await fetch('/api/upload/video', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadData.success) {
        throw new Error(uploadData.error || 'Upload failed');
      }

      // Add video to list
      const newVideoItem: VideoItem = {
        title: newVideo.title,
        url: uploadData.url,
        moduleId: selectedModule,
        order: videos.filter(v => v.moduleId === selectedModule).length,
      };

      setVideos([...videos, newVideoItem]);
      
      // Reset form
      setNewVideo({ title: '', file: null });
      (document.getElementById('video-file') as HTMLInputElement).value = '';

      alert('Video uploaded successfully! Click "Save All Changes" to apply.');
    } catch (error: any) {
      console.error('Error uploading video:', error);
      alert(error.message || 'Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveAllChanges = async () => {
    setSaving(true);

    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videos }),
      });

      const data = await res.json();

      if (data.success) {
        alert('All changes saved successfully!');
        fetchCourseData();
      } else {
        throw new Error(data.error || 'Failed to save');
      }
    } catch (error: any) {
      console.error('Error saving:', error);
      alert(error.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const removeVideo = (index: number) => {
    if (confirm('Are you sure you want to remove this video?')) {
      setVideos(videos.filter((_, i) => i !== index));
    }
  };

  const getModuleName = (moduleId: string) => {
    return modules.find(m => m._id === moduleId)?.name || 'Unknown Module';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
          href={`/admin/courses/${courseId}/edit`}
          className="flex items-center gap-2 text-primary-600 hover:gap-3 transition-all mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Course
        </Link>

        <div className="max-w-5xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Manage Videos</h1>
              <p className="text-gray-600">{courseName}</p>
            </div>
            <button
              onClick={handleSaveAllChanges}
              disabled={saving}
              className="btn btn-primary flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>

          {/* Upload Section */}
          <div className="card p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Upload className="w-6 h-6" />
              Upload New Video
            </h2>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="label">Select Module *</label>
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  className="input"
                  required
                >
                  {modules.map((module) => (
                    <option key={module._id} value={module._id}>
                      {module.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Video Title *</label>
                <input
                  type="text"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                  className="input"
                  placeholder="e.g., Introduction to JavaScript"
                  required
                />
              </div>

              <div>
                <label className="label">Select Video File *</label>
                <input
                  id="video-file"
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/quicktime"
                  onChange={handleFileSelect}
                  className="input"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: MP4, WebM, OGG, MOV (Max 100MB)
                </p>
                {newVideo.file && (
                  <p className="text-sm text-green-600 mt-2">
                    Selected: {newVideo.file.name} ({(newVideo.file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Upload Video
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Videos List */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Video className="w-6 h-6" />
              All Videos ({videos.length})
            </h2>

            {videos.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No videos uploaded yet. Upload your first video above!
              </p>
            ) : (
              <div className="space-y-3">
                {modules.map((module) => {
                  const moduleVideos = videos.filter(v => v.moduleId === module._id);
                  if (moduleVideos.length === 0) return null;

                  return (
                    <div key={module._id} className="border-l-4 border-primary-500 pl-4">
                      <h3 className="font-bold text-lg mb-2">{module.name}</h3>
                      {moduleVideos.map((video, index) => {
                        const globalIndex = videos.findIndex(v => v === video);
                        return (
                          <div
                            key={globalIndex}
                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-2"
                          >
                            <Video className="w-5 h-5 text-gray-400" />
                            <div className="flex-1">
                              <p className="font-medium">{video.title}</p>
                              <p className="text-sm text-gray-500">{video.url}</p>
                            </div>
                            <button
                              onClick={() => removeVideo(globalIndex)}
                              className="btn bg-red-500 text-white hover:bg-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
