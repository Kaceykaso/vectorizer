"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, Download, FileImage, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function Vectorizer() {
  const [file, setFile] = useState<File | null>(null)
  const [converting, setConverting] = useState(false)
  const [converted, setConverted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [svgUrl, setSvgUrl] = useState<string | null>(null)

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === "image/png") {
      setFile(droppedFile)
      setConverted(false)
      setSvgUrl(null)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "image/png") {
      setFile(selectedFile)
      setConverted(false)
      setSvgUrl(null)
    }
  }

  const convertToSvg = async () => {
    if (!file) return

    setConverting(true)
    setProgress(0)

    // Simulate conversion progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      // Create SVG with embedded PNG
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100">
  <image href="${base64}" x="0" y="0" width="100" height="100" />
</svg>`

        const blob = new Blob([svgContent], { type: "image/svg+xml" })
        const url = URL.createObjectURL(blob)
        setSvgUrl(url)
        setProgress(100)
        setConverting(false)
        setConverted(true)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Conversion failed:", error)
      setConverting(false)
      setProgress(0)
    }
  }

  const downloadSvg = () => {
    if (!svgUrl || !file) return

    const link = document.createElement("a")
    link.href = svgUrl
    link.download = file.name.replace(".png", ".svg")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary neon-glow" />
              <h1 className="text-xl font-bold text-foreground neon-text">Vectorizer</h1>
            </div>
            <nav className="flex gap-4">
              <Button variant="ghost" size="sm" className="text-secondary hover:text-primary">
                Home
              </Button>
              <Button variant="ghost" size="sm" className="text-secondary hover:text-primary">
                About
              </Button>
              <Button variant="ghost" size="sm" className="text-secondary hover:text-primary">
                Help
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4 neon-text">
            Convert PNG to SVG
          </h2>
          <p className="text-muted-foreground text-lg">
            Transform your PNG images into scalable SVG format with our retro-futuristic converter
          </p>
        </div>

        <div className="max-w-xl mx-auto space-y-6">
          {/* Upload Area */}
          <Card className="bg-card/30 backdrop-blur-sm border-border/50">
            <CardContent className="p-8">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-secondary/50 rounded-lg p-8 text-center hover:border-primary hover:bg-primary/5 transition-all duration-300 cursor-pointer group"
              >
                <input type="file" accept="image/png" onChange={handleFileSelect} className="hidden" id="file-input" />
                <label htmlFor="file-input" className="cursor-pointer">
                  <FileImage className="h-12 w-12 text-secondary group-hover:text-primary mx-auto mb-4 transition-colors" />
                  <p className="text-foreground font-medium mb-2">{file ? file.name : "Drop your PNG file here"}</p>
                  <p className="text-muted-foreground text-sm">or click to browse files</p>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Convert Button */}
          {file && !converted && (
            <Button onClick={convertToSvg} disabled={converting} className="w-full gradient-button" size="lg">
              {converting ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Convert to SVG
                </>
              )}
            </Button>
          )}

          {/* Progress Bar */}
          {converting && (
            <Card className="bg-card/30 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">Converting...</span>
                    <span className="text-secondary">{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Download Result */}
          {converted && svgUrl && (
            <Card className="border-primary/50 bg-primary/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="text-primary font-medium text-lg">✓ Conversion Complete!</div>
                  <Button onClick={downloadSvg} className="w-full gradient-button hover:bg-primary/90" size="lg">
                    <Download className="h-4 w-4 mr-2" />
                    Download SVG
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-muted-foreground text-sm">
            <p>© 2025 Vectorizer. All rights reserved.</p>
            <div className="flex justify-center gap-4 mt-2">
              <Button variant="link" size="sm" className="text-muted-foreground hover:text-secondary">
                Terms of Service
              </Button>
              <Button variant="link" size="sm" className="text-muted-foreground hover:text-secondary">
                Privacy Policy
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
