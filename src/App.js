import React, { useState, useEffect, useRef } from 'react';

function App() {
  // IMPORTANT: Replace with your actual Unsplash Access Key
  // 1. Go to https://unsplash.com/developers
  // 2. Log in or sign up.
  // 3. Click 'Your apps' -> 'New Application'
  // 4. Agree to the terms, create the app, and find your 'Access Key'.
  //    (Keep your Secret Key private, only Access Key is needed for client-side search)
  const unsplashAccessKey = "MJyrbwnYwakN_Ae-xzhsLiL6D9DNupldeph-gQ1r65g"; // Your Unsplash Access Key

  // Changed initial query state to 'nature' to show images on first load
  const [query, setQuery] = useState('nature');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const searchInputRef = useRef(null); // Ref for the search input

  // Function to fetch images from Unsplash
  const fetchImages = async (searchQuery, pageNumber) => {
    if (!unsplashAccessKey) {
      setError("Please add your Unsplash Access Key in the code (unsplashAccessKey variable).");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?page=${pageNumber}&per_page=25&query=${searchQuery}`,
        {
          headers: {
            Authorization: `Client-ID ${unsplashAccessKey}`,
          },
        }
      );

      if (!response.ok) {
        // Handle API errors
        const errorData = await response.json();
        // Provide more specific error messages for common Unsplash issues
        if (response.status === 403) {
            throw new Error("API Rate Limit Exceeded or Invalid Access Key. Please wait a bit or check your key.");
        } else if (response.status === 401) {
            throw new Error("Unauthorized: Invalid Unsplash Access Key. Please check your key.");
        } else {
            throw new Error(errorData.errors ? errorData.errors.join(', ') : 'Failed to fetch images');
        }
      }

      const data = await response.json();
      setImages(data.results);
      setTotalPages(data.total_pages);

      if (data.results.length === 0) {
        setError('No images found for your search. Try a different query!');
      }
    } catch (err) {
      console.error("Error fetching images:", err);
      setError(`Failed to load images: ${err.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault(); // Prevent page reload on form submission
    setPage(1); // Reset to first page for new search
    fetchImages(query, 1);
  };

  // Handle download
  const handleDownload = async (imageUrl, downloadLocation) => {
    // According to Unsplash API guidelines, call the download location to track downloads
    try {
      await fetch(downloadLocation, {
        headers: {
          Authorization: `Client-ID ${unsplashAccessKey}`,
        },
      });
      // Then, open the image URL to allow browser to download
      window.open(imageUrl + '?force=true', '_blank'); // Add ?force=true to encourage download
    } catch (err) {
      console.error("Error initiating download:", err);
      // Fallback: just open the image in a new tab if download tracking fails
      window.open(imageUrl, '_blank');
    }
  };

  // Fetch images on initial load or when page/query changes
  useEffect(() => {
    // This effect now always fetches if query or page changes
    // It will run on initial mount due to 'nature' being the default query
    fetchImages(query, page);
  }, [page, query]); // Depend on both page and query

  // Focus on search input when component mounts
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);


  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-indigo-100 to-purple-200 p-4 font-inter text-gray-800">
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-8 text-indigo-800 drop-shadow-md text-center">
        Royalty-Free Image Finder
      </h1>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="w-full max-w-xl mb-8">
        <div className="flex rounded-full shadow-lg overflow-hidden border border-indigo-300">
          <input
            ref={searchInputRef}
            type="text"
            className="flex-grow px-6 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-l-full"
            placeholder="Search for images (e.g., nature, city, food)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            className="px-8 py-3 bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-300 rounded-r-full"
          >
            Search
          </button>
        </div>
      </form>

      {/* Error and Loading Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 max-w-md text-center" role="alert">
          <p className="font-bold">Error!</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center text-indigo-700 text-xl font-semibold mt-8">
          <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading images...
        </div>
      )}

      {/* Image Results Grid */}
      {!loading && images.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4 mt-8 w-full max-w-screen-xl">
            {images.map((image) => (
              <div
                key={image.id}
                className="relative bg-gray-100 rounded-lg shadow-md overflow-hidden group cursor-pointer aspect-w-16 aspect-h-9"
              >
                <img
                  src={image.urls.small} // Use 'small' for display
                  alt={image.alt_description || 'Image'}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x300/e0e0e0/555555?text=Image+Load+Error"; }}
                />
                {/* Download Button on Hover */}
                <div
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <button
                    className="px-4 py-2 bg-white text-indigo-700 font-semibold rounded-full shadow-lg hover:bg-indigo-100 transition-all duration-200"
                    onClick={() => handleDownload(image.urls.full, image.links.download_location)} // Use 'full' for download
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8 mb-4">
              <button
                className="px-4 py-2 bg-indigo-500 text-white font-semibold rounded-lg shadow hover:bg-indigo-600 disabled:opacity-50"
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1 || loading}
              >
                Previous
              </button>
              <span className="text-lg font-medium text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                className="px-4 py-2 bg-indigo-500 text-white font-semibold rounded-lg shadow hover:bg-indigo-600 disabled:opacity-50"
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages || loading}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
