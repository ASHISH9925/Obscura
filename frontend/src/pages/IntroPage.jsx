import { useState } from 'react';
import { Shield, Lock, Image, Key, Zap, Eye } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import GraphCard from '../components/GraphCard';
import { BackgroundBeams } from '../components/ui/background-beams';
import { GlareCard } from '../components/ui/glare-card';
import { CanvasRevealEffect } from '../components/ui/canvas-reveal-effect';
import { SparklesCore } from '../components/ui/sparkles';
import { Link } from 'react-router-dom';

export default function IntroPage() {
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const features = [
    {
      icon: Lock,
      title: 'AES-256-GCM Encryption',
      description: 'Military-grade encryption with authenticated encryption mode',
      expandedInfo: 'Using AES-256-GCM (Galois/Counter Mode), each file is encrypted with a unique 32-byte random key and a 12-byte initialization vector. GCM mode provides both encryption and authentication, ensuring your data remains confidential and tamper-proof. This is the same encryption standard used by governments and financial institutions worldwide.',
      color: 'from-cyan-400 to-blue-500',
    },
    {
      icon: Image,
      title: 'Steganography',
      description: 'Encryption keys hidden inside PNG images using advanced techniques',
      expandedInfo: 'Your encryption key is embedded invisibly into the least significant bits of a random PNG image fetched from Pexels. This technique makes it impossible to detect that the image contains hidden data. The key becomes part of the image itself, providing an elegant solution to key storage without traditional password management.',
      color: 'from-blue-400 to-purple-500',
    },
    {
      icon: Key,
      title: 'Zero Knowledge',
      description: 'Keys never stored on servers - only you control decryption',
      expandedInfo: 'Your encryption keys are never transmitted to or stored on our servers in any form. The key exists only in the PNG image you download. This zero-knowledge architecture means even if our servers were compromised, your encrypted files would remain secure. Only you possess the means to decrypt your data.',
      color: 'from-purple-400 to-pink-500',
    },
    {
      icon: Zap,
      title: 'Fast Processing',
      description: 'Instant encryption and decryption up to 15MB files',
      expandedInfo: 'Built on Node.js with Express, our backend processes encryption operations in milliseconds. Files are stored efficiently in MongoDB, with the entire encryption pipeline optimized for speed. Upload your file and receive your encrypted version with the key-image almost instantly, no matter the file type.',
      color: 'from-pink-400 to-red-500',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16 relative overflow-hidden">
      <div className="absolute inset-0">
        <BackgroundBeams className="opacity-40" />
      </div>
      <div className="max-w-9xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-block mb-6">
              <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/30 blur-3xl" />
              {/* slightly larger shield for stronger visual presence */}
              <Shield className="w-36 h-36 md:w-48 md:h-48 text-cyan-400 relative animate-pulse" />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-audiowide mb-6">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              OBSCURA
            </span>
          </h1>

          <div className="w-full max-w-2xl mx-auto h-40 relative mb-6">
            <div className="absolute inset-x-10 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm left-1/2 -translate-x-1/2" />
            <div className="absolute inset-x-10 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4 left-1/2 -translate-x-1/2" />
            <div className="absolute inset-x-20 top-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent h-[5px] w-1/2 blur-sm left-1/2 -translate-x-1/2" />
            <div className="absolute inset-x-20 top-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent h-px w-1/2 left-1/2 -translate-x-1/2" />

            {/* larger, slightly sparser sparkles so each particle is more visible */}
            <SparklesCore
              background="transparent"
              minSize={0.8}
              maxSize={2}
              particleDensity={500}
              className="w-full h-full"
              particleColor="#FFFFFF"
              speed={2}
            />

            <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(350px_100px_at_top,transparent_20%,white)]"></div>
          </div>

          <p className="text-2xl text-gray-400 mb-4 max-w-3xl mx-auto">
            Secure File Encryption with Invisible Key Storage
          </p>

          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            Hide your encryption keys inside images. No passwords to remember, no keys to store.
            Just upload, encrypt, and download your key-image.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              to="/encrypt"
              className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-lg overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Start Encrypting
              </span>
            </Link>

            <Link
              to="/decrypt"
              className="px-8 py-4 bg-gray-800/50 border border-gray-700 hover:border-cyan-500 rounded-xl font-bold text-lg transform hover:scale-105 transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Decrypt File
              </span>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group/canvas-card relative bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all duration-500 overflow-hidden cursor-pointer h-auto min-h-[20rem] md:min-h-[22rem] lg:min-h-[24rem]"
            >
              <AnimatePresence>
                {hoveredFeature === index && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="pointer-events-none absolute inset-0 z-10"
                  >
                    <CanvasRevealEffect
                      animationSpeed={3}
                      containerClassName="bg-black/30"
                      colors={
                        feature.color === 'from-cyan-400 to-blue-500'
                          ? [[0, 255, 255], [100, 200, 255]]
                          : feature.color === 'from-blue-400 to-purple-500'
                          ? [[100, 150, 255], [150, 100, 255]]
                          : feature.color === 'from-purple-400 to-pink-500'
                          ? [[200, 100, 255], [220, 100, 255]]
                          : [[255, 100, 200], [255, 150, 200]]
                      }
                      dotSize={2}
                    />
                    <div className="absolute inset-0 [mask-image:radial-gradient(420px_at_center,white,transparent)] bg-black/40" />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                <motion.div
                  key={`content-${index}`}
                  initial={{ opacity: 1 }}
                  animate={{ opacity: hoveredFeature === index ? 0 : 1 }}
                  className="relative z-20"
                >
                  <div className="relative inline-block mb-4">
                    <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-20 blur-xl group-hover:opacity-30 transition-all duration-300`} />
                    <feature.icon className={`w-12 h-12 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent relative`} />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </motion.div>

                {hoveredFeature === index && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-6 flex items-center justify-center z-20"
                  >
                    <p className="text-gray-200 text-sm leading-relaxed text-center font-medium">
                      {feature.expandedInfo}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="mb-24">
          <h2 className="text-3xl md:text-4xl font-lato font-semibold text-center mb-12">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Live Encryption Stats
            </span>
          </h2>
          <div className="max-w-2xl mx-auto">
            <GraphCard />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-lato font-semibold text-center mb-20">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              How It Works
            </span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[{
              step: '01',
              title: 'Upload File',
              points: [
                'Choose any file type up to 15MB',
                'Runs client-side validations (type & size)',
                'No keys or secrets leave your device',
              ],
            },
            {
              step: '02',
              title: 'Encrypt & Store',
              points: [
                'AES‑256‑GCM with random 32‑byte key',
                '12‑byte IV per file, authenticated tag',
                'Encrypted blob stored and returns File ID',
              ],
            },
            {
              step: '03',
              title: 'Key Image',
              points: [
                'Key embedded invisibly into PNG (LSB)',
                'Image looks normal, cannot be detected',
                'You download and keep the key‑image only',
              ],
            },
            {
              step: '04',
              title: 'Decrypt Anytime',
              points: [
                'Provide File ID + key‑image',
                'Server reconstructs key and decrypts',
                'Original file is streamed back to you',
              ],
            }].map((card, index) => (
              <GlareCard
                key={index}
                containerClassName="w-full"
                className="flex flex-col items-start justify-start p-4 md:p-6"
              >
                <div className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-400/50 to-blue-500/50 bg-clip-text text-transparent mb-2">
                  {card.step}
                </div>
                <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold text-white mb-4 md:mb-5">{card.title}</h3>
                <ul className="text-gray-300 text-sm md:text-base space-y-2 md:space-y-3 list-disc pl-5">
                  {card.points.map((p, i) => (
                    <li key={i} className="leading-relaxed">{p}</li>
                  ))}
                </ul>
              </GlareCard>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400 mb-4">Made by Ashish Ajay Sharma</p>
          <div className="flex justify-center gap-6">
            <a
              href="https://github.com/ASHISH9925"
              target="_blank"
              rel="noopener noreferrer"
              className="transform hover:scale-110 transition-transform duration-300"
            >
              <img src="/github.png" alt="GitHub" className="w-8 h-8 opacity-70 hover:opacity-100 transition-opacity invert" />
            </a>
            <a
              href="https://www.linkedin.com/in/ashish-sharma-31a229281/"
              target="_blank"
              rel="noopener noreferrer"
              className="transform hover:scale-110 transition-transform duration-300"
            >
              <img src="/linkedin.png" alt="LinkedIn" className="w-8 h-8 opacity-70 hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
