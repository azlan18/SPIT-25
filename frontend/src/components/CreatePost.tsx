import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

export default function CreatePost() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  // Check authentication at component level
  useEffect(() => {
    if (!token || !userId) {
      navigate('/login');
    }
  }, [token, userId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!token || !userId) {
      setError('You must be logged in to create a post');
      navigate('/login');
      return;
    }

    if (!file) {
      setError('Please select an image');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('image', file);
      formData.append('author', userId);

      const response = await axios.post('http://localhost:3000/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      navigate(`/posts/${response.data._id}`);
    } catch (err: any) {
      console.error('Error creating post:', err);
      if (err.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to create post. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const removeImage = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="max-w-2xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616] p-6"
        >
          <h1 className="text-2xl font-bold mb-6">Create a New Post</h1>
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#151616] focus:ring-2 focus:ring-[#D6F32F] focus:border-[#151616] transition-all"
                required
              />
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium mb-2">
                Content
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#151616] focus:ring-2 focus:ring-[#D6F32F] focus:border-[#151616] transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Image
              </label>
              {!previewUrl ? (
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#151616] rounded-lg cursor-pointer hover:bg-[#D6F32F]/10 transition-colors"
                  >
                    <ImageIcon className="w-8 h-8 mb-2 text-gray-500" />
                    <span className="text-sm text-gray-500">Click to upload an image</span>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-[#D6F32F] rounded-lg border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616] hover:shadow-[2px_2px_0px_0px_#151616] hover:translate-y-[2px] hover:translate-x-[2px] transition-all font-medium disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Upload className="w-5 h-5 animate-spin mr-2" />
                  Creating...
                </span>
              ) : (
                'Create Post'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}