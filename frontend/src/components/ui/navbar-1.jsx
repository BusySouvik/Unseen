"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Menu, X } from "lucide-react"

const Navbar1 = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <div className="flex justify-center w-full px-4 py-4">
      <div className="relative z-10 flex w-full max-w-6xl items-center justify-between rounded-full border border-white/10 bg-black/60 px-6 py-3 shadow-2xl backdrop-blur-xl">

        <div className="flex items-center">
          <motion.div
            className="mr-4 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            whileHover={{ rotate: 10, scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-sm font-bold text-black">
              S
            </span>
          </motion.div>

          <span className="hidden font-semibold text-white sm:block">
            StockSense
          </span>
        </div>

        <nav className="hidden items-center space-x-8 md:flex">
          {["Home", "Features", "Workflow", "Analytics"].map((item) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -1 }}
              transition={{ duration: 0.3 }}
              className="text-sm font-medium text-white/60 transition-colors hover:text-white"
            >
              {item}
            </motion.a>
          ))}
        </nav>

        <motion.a
          href="#dashboard"
          className="hidden rounded-full bg-white px-5 py-2 text-sm font-medium text-black md:inline-flex"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          Open Dashboard
        </motion.a>

        <motion.button
          className="flex items-center md:hidden"
          onClick={toggleMenu}
          whileTap={{ scale: 0.9 }}
        >
          {isOpen
            ? <X className="h-6 w-6 text-white" />
            : <Menu className="h-6 w-6 text-white" />
          }
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/95 px-6 pt-24 backdrop-blur-xl md:hidden"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <motion.button
              className="absolute right-6 top-6 p-2"
              onClick={toggleMenu}
              whileTap={{ scale: 0.9 }}
            >
              <X className="h-6 w-6 text-white" />
            </motion.button>

            <div className="flex flex-col space-y-7">
              {["Home", "Features", "Workflow", "Analytics"].map((item, i) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.1 }}
                  onClick={toggleMenu}
                  className="text-xl font-medium text-white"
                >
                  {item}
                </motion.a>
              ))}

              <motion.a
                href="#dashboard"
                className="rounded-full bg-white px-5 py-3 text-center font-medium text-black"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={toggleMenu}
              >
                Open Dashboard
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { Navbar1 }
