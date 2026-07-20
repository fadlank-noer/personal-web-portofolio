import { useState } from 'preact/hooks';
import roboTradeImg from "../../assets/projects/robo-trade.png";
import webPortofolioImg from "../../assets/projects/web-portofolio.png";

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  technologies: string[];
  demoUrl?: string;
  githubUrl?: string;
}

const projects: Project[] = [
  {
    id: 1,
    title: "Valtara Trade System",
    description: "Trading platform with real-time market data and portfolio management.",
    image: roboTradeImg.src,
    category: "System",
    technologies: ["MQL5", "Python"],
    demoUrl: "#",
    githubUrl: "#"
  },
  {
    id: 2,
    title: "Portfolio Website",
    description: "Modern portfolio website showcasing multiple frontend frameworks.",
    image: webPortofolioImg.src,
    category: "Fullstack",
    technologies: ["Astro", "React", "Vue", "Svelte", "Tailwind"],
    demoUrl: "#",
    githubUrl: "https://github.com/fadlank-noer/web-portofolio"
  }
];

const ProjectGallery = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const categories = ['All', 'Fullstack', 'System'];

  const filteredProjects = selectedCategory === 'All' 
    ? projects 
    : projects.filter(project => project.category === selectedCategory);

  return (
    <div id="anchor-projects" className="w-screen min-h-screen bg-gray-50 overflow-x-hidden py-12 md:py-16 px-4 md:px-10">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <i className="text-2xl md:text-3xl text-gray-600">Portfolio</i>
          <h2 className="text-4xl md:text-6xl font-bold my-4 bg-gradient-to-r from-(--primary-color) via-(--secondary-color) to-(--gradient-first) text-transparent bg-clip-text">
            My Projects
          </h2>
          <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto">
            A showcase of my work across different technologies and domains
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-10 md:mb-12">
          <div className="flex flex-wrap gap-3 md:gap-4 bg-white rounded-full p-2 shadow-lg">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 md:px-6 py-2.5 md:py-3 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-(--primary-color) text-white shadow-md'
                    : 'text-gray-600 hover:text-(--primary-color) hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredProjects.map(project => (
            <div
              key={project.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              onMouseEnter={() => setHoveredProject(project.id)}
              onMouseLeave={() => setHoveredProject(null)}
            >
              {/* Project Image Preview Button */}
              <div className="relative h-48 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] rounded-t-xl overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <button
                    onClick={() => {
                      setPreviewImage(project.image);
                      setShowPreview(true);
                    }}
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg p-4 transition-all duration-300 group"
                    aria-label={`Preview ${project.title}`}
                  >
                    <div className="text-center">
                      <svg className="w-12 h-12 mx-auto mb-2 text-white group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      <p className="text-white font-medium">Preview Image</p>
                      <p className="text-white/80 text-sm">Click to view</p>
                    </div>
                  </button>
                </div>

                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-3">
                  <h3 className="text-white font-bold text-lg truncate">{project.title}</h3>
                </div>
              </div>

              {/* Project Info */}
              <div className="p-4 md:p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg md:text-xl font-bold text-gray-800">{project.title}</h3>
                  <span className="text-xs font-medium text-[var(--primary-color)] bg-[var(--primary-color)]/10 px-2 py-1 rounded-full">
                    {project.category}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 text-sm md:text-base leading-relaxed">
                  {project.description}
                </p>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map(tech => (
                    <span 
                      key={tech}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-xl">No projects found in this category.</p>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {showPreview && previewImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowPreview(false);
            setPreviewImage(null);
          }}
        >
          <div 
            className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setShowPreview(false);
                setPreviewImage(null);
              }}
              className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors z-10"
              aria-label="Close preview"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>

            {/* Image */}
            <img 
              src={previewImage} 
              alt="Project preview"
              className="w-full h-full object-contain max-h-[80vh]"
              onError={() => {
                setShowPreview(false);
                setPreviewImage(null);
              }}
            />

          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectGallery;
