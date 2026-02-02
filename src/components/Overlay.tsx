import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkstationStore } from '../store';
import { 
  projectsData, 
  profileData, 
  bootSequence, 
  asciiArt,
  getProjectById,
  helpText,
  skillsData,
} from '../data';
import type { ViewState } from '../store';

/**
 * Hook to detect mobile viewport
 * Updated to check window immediately to prevent layout shift
 */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    // Check immediately if window is defined (client-side)
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Add listener
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
}

/**
 * Boot sequence animation
 */
function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  
  useEffect(() => {
    if (visibleLines < bootSequence.length) {
      const timer = setTimeout(() => {
        setVisibleLines(prev => prev + 1);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      const completeTimer = setTimeout(onComplete, 500);
      return () => clearTimeout(completeTimer);
    }
  }, [visibleLines, onComplete]);
  
  return (
    <div className="font-mono text-sm">
      {bootSequence.slice(0, visibleLines).map((line, i) => (
        <div key={i} className="phosphor-text opacity-70">
          {line}
        </div>
      ))}
    </div>
  );
}

/**
 * Main Terminal/CLI interface
 * Displays when currentView === 'monitor'
 */
function TerminalView() {
  const { setView, isAnimating } = useWorkstationStore();
  const [booted, setBooted] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  
  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };
  
  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    let response: string[] = [];
    
    if (trimmedCmd === 'help') {
      response = helpText;
    } else if (trimmedCmd === 'clear') {
      setCommandHistory([]);
      setInputValue('');
      return;
    } else if (trimmedCmd === 'list') {
      response = [
        'Available projects:',
        ...projectsData.map(p => `  > run ${p.executable}`),
      ];
    } else if (trimmedCmd === 'about') {
      response = [
        `Name: ${profileData.name}`,
        `Title: ${profileData.title}`,
        `Education: ${profileData.degree}`,
        `University: ${profileData.university}`,
        `GPA: ${profileData.gpa}`,
        `Email: ${profileData.email}`,
        `LinkedIn: ${profileData.linkedin}`,
        `GitHub: ${profileData.github}`,
      ];
    } else if (trimmedCmd === 'skills') {
      response = [
        'PROGRAMMING:',
        `  ${skillsData.programming.join(', ')}`,
        '',
        'SOFTWARE:',
        `  ${skillsData.software.join(', ')}`,
        '',
        'HARDWARE:',
        `  ${skillsData.hardware.join(', ')}`,
      ];
    } else if (trimmedCmd === 'resume') {
      response = ['Opening resume...'];
      window.open('/resume.pdf', '_blank');
    } else if (trimmedCmd.startsWith('run ')) {
      const executable = trimmedCmd.replace('run ', '');
      const project = projectsData.find(p => 
        p.executable.toLowerCase() === executable || 
        p.executable.toLowerCase().replace('.exe', '') === executable
      );
      
      if (project) {
        setCommandHistory(prev => [...prev, `> ${cmd}`, `Loading ${project.title}...`]);
        setInputValue('');
        setTimeout(() => setView(project.id), 300);
        return;
      } else {
        response = [`Error: '${executable}' not found. Type 'list' for available projects.`];
      }
    } else if (trimmedCmd) {
      response = [`Command not recognized: '${trimmedCmd}'. Type 'help' for commands.`];
    }
    
    setCommandHistory(prev => [...prev, `> ${cmd}`, ...response]);
    setInputValue('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(inputValue);
    }
  };
  
  const handleProjectClick = (id: ViewState) => {
    if (!isAnimating) {
      const project = getProjectById(id);
      if (project) {
        setCommandHistory(prev => [...prev, `> run ${project.executable}`, `Loading ${project.title}...`]);
        setTimeout(() => setView(id), 300);
      }
    }
  };
  
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commandHistory]);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 flex items-center justify-center p-2 sm:p-4"
    >
      <div 
        className="w-full max-w-3xl h-[85vh] sm:h-[80vh] max-h-[700px] crt-bezel crt-scanlines noise-overlay"
        onClick={handleTerminalClick}
      >
        <div className="w-full h-full bg-terminal-bg rounded overflow-hidden flex flex-col">
          {/* Terminal header bar */}
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-terminal-bglight border-b border-terminal-green/20">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="ml-2 text-terminal-green/60 text-[10px] sm:text-xs font-mono truncate">
              EDUSEI_WORKSTATION — bash — 80x24
            </span>
          </div>
          
          {/* Terminal content */}
          <div 
            ref={terminalRef}
            className="flex-1 overflow-y-auto p-3 sm:p-4 font-mono text-xs sm:text-sm crt-flicker"
          >
            {!booted ? (
              <BootSequence onComplete={() => setBooted(true)} />
            ) : (
              <>
                {/* ASCII Art Header - desktop only */}
                <pre className="phosphor-text text-[10px] leading-tight mb-4 hidden md:block whitespace-pre">
                  {asciiArt}
                </pre>
                
                {/* Mobile header */}
                <div className="md:hidden mb-4 border border-terminal-green/30 p-3 rounded">
                  <div className="phosphor-text-bright text-base font-bold">EDUSEI WORKSTATION</div>
                  <div className="phosphor-text text-xs mt-1">[SOFTWARE ENGINEER]</div>
                </div>
                
                {/* Profile info */}
                <div className="mb-4 phosphor-text">
                  <div className="text-phosphor-dim text-xs sm:text-sm">
                    // {profileData.name} | {profileData.title}
                  </div>
                  <div className="text-phosphor-dim text-[10px] sm:text-xs">
                    // {profileData.university} | Class of {profileData.graduationYear}
                  </div>
                </div>
                
                {/* Divider */}
                <div className="phosphor-text opacity-30 mb-4 overflow-hidden">
                  {'─'.repeat(50)}
                </div>
                
                {/* Command history */}
                {commandHistory.map((line, i) => (
                  <div 
                    key={i} 
                    className={`phosphor-text text-xs sm:text-sm ${line.startsWith('>') ? 'text-phosphor-text' : 'text-phosphor-dim'}`}
                  >
                    {line}
                  </div>
                ))}
                
                {/* Projects list */}
                <div className="mb-4">
                  <div className="phosphor-text mb-2 text-phosphor-dim text-xs sm:text-sm">
                    SELECT PROJECT TO EXECUTE:
                  </div>
                  
                  {projectsData.map((project) => (
                    <motion.button
                      key={project.id}
                      onClick={() => handleProjectClick(project.id)}
                      disabled={isAnimating}
                      className={`
                        block w-full text-left py-2 px-2 sm:px-3 my-1 rounded
                        font-mono text-xs sm:text-sm border border-transparent
                        transition-all duration-200
                        ${isAnimating 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:border-terminal-green/50 hover:bg-terminal-green/5 cursor-pointer active:bg-terminal-green/10'
                        }
                      `}
                      whileTap={!isAnimating ? { scale: 0.98 } : {}}
                    >
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="phosphor-text-bright text-[10px] sm:text-sm">[EXEC]</span>
                        <span className="phosphor-text text-xs sm:text-sm">run {project.executable}</span>
                      </div>
                      <div className="text-phosphor-dim text-[10px] sm:text-xs mt-0.5 ml-10 sm:ml-14">
                        // {project.tagline}
                      </div>
                    </motion.button>
                  ))}
                </div>
                
                {/* Command input */}
                <div className="flex items-center phosphor-text text-xs sm:text-sm">
                  <span className="text-phosphor-text mr-1 sm:mr-2">guest@edusei:~$</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent outline-none phosphor-text min-w-0"
                    style={{ caretColor: '#00ff41' }}
                    autoFocus
                  />
                </div>
                
                {/* Help hint */}
                <div className="mt-4 text-phosphor-dim text-[10px] sm:text-xs">
                  Type 'help' for commands • 'resume' to download CV
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Project Detail Panel - RESPONSIVE
 * Desktop: Right side of screen (50% width)
 * Mobile: Bottom sheet overlay (full width)
 */
function ProjectDetailPanel() {
  const { currentView, returnToMonitor, isAnimating } = useWorkstationStore();
  const isMobile = useIsMobile();
  
  const project = getProjectById(currentView);
  
  if (!project || currentView === 'monitor') {
    return null;
  }
  
  // Mobile: Bottom sheet layout with Drag-to-Close
  if (isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ 
          duration: 0.4, 
          delay: 0.3,
          ease: [0.25, 0.1, 0.25, 1]
        }}
        // Add drag gestures
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        onDragEnd={(e, { offset, velocity }) => {
          // Close if dragged down more than 100px OR flicked down fast
          if (offset.y > 100 || velocity.y > 500) {
            !isAnimating && returnToMonitor();
          }
        }}
        className="absolute bottom-0 left-0 right-0 max-h-[85vh] z-10"
      >
        <div className="glass-card rounded-t-2xl p-4 pb-8 overflow-hidden flex flex-col max-h-[85vh]">
          {/* Drag handle */}
          <div className="flex justify-center mb-4 flex-shrink-0 pt-1 cursor-grab active:cursor-grabbing">
            <div className="w-12 h-1.5 bg-terminal-green/30 rounded-full" />
          </div>
          
          <div className="overflow-y-auto pr-1">
            {/* Back button */}
            <motion.button
              onClick={() => !isAnimating && returnToMonitor()}
              disabled={isAnimating}
              className={`
                mb-3 px-3 py-1.5 rounded-lg
                border border-terminal-green/50
                font-mono text-xs phosphor-text
                transition-all duration-200
                ${isAnimating 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'active:bg-terminal-green/10'
                }
              `}
            >
              ← Back
            </motion.button>
            
            {/* Title */}
            <h1 className="text-lg font-bold phosphor-text-bright mb-1">
              {project.title}
            </h1>
            
            {/* Period & Location */}
            <p className="text-phosphor-dim text-[10px] font-mono mb-3">
              {project.period} • {project.location}
            </p>
            
            {/* Description - show only first 2 on mobile */}
            <div className="space-y-2 mb-3">
              {project.description.slice(0, 2).map((paragraph, i) => (
                <p key={i} className="text-gray-300 text-[11px] leading-relaxed font-mono">
                  • {paragraph}
                </p>
              ))}
              {project.description.length > 2 && (
                <p className="text-phosphor-dim text-[10px] font-mono">
                  +{project.description.length - 2} more details...
                </p>
              )}
            </div>
            
            {/* Tech Stack */}
            <div className="mb-3">
              <h3 className="text-phosphor-dim text-[9px] uppercase tracking-wider mb-1.5 font-mono">
                Technologies
              </h3>
              <div className="flex flex-wrap gap-1">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="text-[9px] px-1.5 py-0.5 rounded border border-terminal-green/40 text-terminal-green/80 font-mono"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Related Projects - collapsible on mobile */}
            {project.additionalProjects && project.additionalProjects.length > 0 && (
              <details className="mb-2">
                <summary className="text-phosphor-dim text-[9px] uppercase tracking-wider font-mono cursor-pointer">
                  + {project.additionalProjects.length} Related Project{project.additionalProjects.length > 1 ? 's' : ''}
                </summary>
                <div className="mt-2 space-y-2">
                  {project.additionalProjects.map((addProject, i) => (
                    <div key={i} className="pl-2 border-l border-terminal-green/30">
                      <h4 className="text-phosphor-text font-mono text-[10px] font-semibold">
                        {addProject.title}
                      </h4>
                      <p className="text-phosphor-dim text-[9px]">{addProject.period}</p>
                    </div>
                  ))}
                </div>
              </details>
            )}
            
            {/* Touch hint */}
            <div className="text-center pt-2 border-t border-terminal-green/20 mt-2">
              <span className="text-phosphor-dim text-[9px] font-mono">
                ↓ Swipe down to close
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
  
  // Desktop: Right side panel
  // Updated with responsive width fallback (w-full md:w-1/2)
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ 
        duration: 0.6, 
        delay: 0.5,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      className="absolute top-0 right-0 w-full md:w-1/2 h-full flex items-center justify-center p-8"
    >
      <div className="glass-card rounded-xl p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Back button */}
        <motion.button
          onClick={() => !isAnimating && returnToMonitor()}
          disabled={isAnimating}
          className={`
            mb-6 px-4 py-2 rounded-lg
            border border-terminal-green/50
            font-mono text-sm phosphor-text
            transition-all duration-200
            ${isAnimating 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-terminal-green/10 hover:border-terminal-green'
            }
          `}
          whileHover={!isAnimating ? { scale: 1.02 } : {}}
          whileTap={!isAnimating ? { scale: 0.98 } : {}}
        >
          ← Back to Terminal
        </motion.button>
        
        {/* Title */}
        <motion.h1 
          className="text-3xl font-bold phosphor-text-bright mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          {project.title}
        </motion.h1>
        
        {/* Period & Location */}
        <motion.p 
          className="text-phosphor-dim text-sm font-mono mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {project.period} • {project.location}
        </motion.p>
        
        {/* Description */}
        <motion.div 
          className="space-y-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          {project.description.map((paragraph, i) => (
            <p key={i} className="text-gray-300 text-sm leading-relaxed font-mono">
              • {paragraph}
            </p>
          ))}
        </motion.div>
        
        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mb-8"
        >
          <h3 className="text-phosphor-dim text-xs uppercase tracking-wider mb-3 font-mono">
            Technologies
          </h3>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech, i) => (
              <motion.span
                key={tech}
                className="tech-tag"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1 + i * 0.03 }}
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </motion.div>
        
        {/* Additional/Related Projects */}
        {project.additionalProjects && project.additionalProjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <h3 className="text-phosphor-dim text-xs uppercase tracking-wider mb-4 font-mono">
              Related Projects
            </h3>
            {project.additionalProjects.map((addProject, i) => (
              <div key={i} className="mb-4 pl-4 border-l-2 border-terminal-green/30">
                <h4 className="text-phosphor-text font-mono text-sm font-semibold">
                  {addProject.title}
                </h4>
                <p className="text-phosphor-dim text-xs mb-2">{addProject.period}</p>
                {addProject.description.map((desc, j) => (
                  <p key={j} className="text-gray-400 text-xs leading-relaxed mb-1">
                    • {desc}
                  </p>
                ))}
              </div>
            ))}
          </motion.div>
        )}
        
        {/* Drag hint */}
        <motion.div 
          className="mt-6 pt-4 border-t border-terminal-green/20 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          <span className="text-phosphor-dim text-xs font-mono">
            ↺ Drag the 3D model to rotate
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}

/**
 * Loading/Transition indicator
 */
function TransitionIndicator() {
  const { isAnimating, currentView } = useWorkstationStore();
  
  if (!isAnimating) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="glass-card px-3 py-1.5 rounded-full">
        <div className="flex items-center gap-2 phosphor-text text-xs font-mono">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          >
            ◐
          </motion.span>
          {currentView === 'monitor' ? 'Returning...' : 'Loading...'}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Social links - repositioned on mobile
 */
function SocialLinks() {
  const { currentView } = useWorkstationStore();
  const isMobile = useIsMobile();
  
  // Hide completely when viewing a project on mobile (bottom sheet covers it)
  if (currentView !== 'monitor' && isMobile) return null;
  
  return (
    <motion.div 
      className={`absolute ${currentView === 'monitor' ? 'bottom-16 right-4' : 'bottom-16 left-4'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: currentView === 'monitor' ? 2 : 0.8 }}
    >
      <div className="flex gap-2 sm:gap-3">
        <a
          href={`https://${profileData.linkedin}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2 sm:px-3 py-1 sm:py-1.5 rounded border border-terminal-green/30 text-phosphor-dim text-[10px] sm:text-xs font-mono transition-all hover:border-terminal-green hover:text-terminal-green"
        >
          LinkedIn
        </a>
        <a
          href={`https://${profileData.github}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2 sm:px-3 py-1 sm:py-1.5 rounded border border-terminal-green/30 text-phosphor-dim text-[10px] sm:text-xs font-mono transition-all hover:border-terminal-green hover:text-terminal-green"
        >
          GitHub
        </a>
        <a
          href={`mailto:${profileData.email}`}
          className="px-2 sm:px-3 py-1 sm:py-1.5 rounded border border-terminal-green/30 text-phosphor-dim text-[10px] sm:text-xs font-mono transition-all hover:border-terminal-green hover:text-terminal-green"
        >
          Email
        </a>
      </div>
    </motion.div>
  );
}

/**
 * Main Overlay Component
 */
export function Overlay() {
  const { currentView } = useWorkstationStore();
  
  return (
    <div className="overlay-container">
      <AnimatePresence mode="wait">
        {currentView === 'monitor' ? (
          <TerminalView key="terminal" />
        ) : (
          <ProjectDetailPanel key="project-detail" />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        <TransitionIndicator key="transition" />
      </AnimatePresence>
      
      <SocialLinks />
    </div>
  );
}