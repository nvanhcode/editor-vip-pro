"use client"

import { useState, useContext } from "react"
import { EditorContext } from "@tiptap/react"
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Input } from "@/components/tiptap-ui-primitive/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/tiptap-ui-primitive/popover"
import { YoutubeIcon } from "@/components/tiptap-icons/youtube-icon"

export function YoutubeButton() {
  const { editor } = useContext(EditorContext)
  const [isOpen, setIsOpen] = useState(false)
  const [url, setUrl] = useState("")
  const [error, setError] = useState("")

  if (!editor) {
    return null
  }

  const validateYoutubeUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    return youtubeRegex.test(url)
  }

  const handleSubmit = () => {
    if (!url.trim()) {
      setError("Please enter a YouTube URL")
      return
    }

    if (!validateYoutubeUrl(url)) {
      setError("Please enter a valid YouTube URL")
      return
    }

    // Auto set width to 100% and calculate height with 16:9 ratio
    // We'll let the extension handle the responsive sizing
    editor.commands.setYoutubeVideo({
      src: url,
      width: 640, // Default width, will be overridden by CSS
      height: 360, // 16:9 ratio (640 * 9 / 16 = 360)
    })

    // Reset form
    setUrl("")
    setError("")
    setIsOpen(false)
  }

  const handleClose = () => {
    setIsOpen(false)
    setUrl("")
    setError("")
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          data-style="ghost"
          aria-label="Add YouTube video"
          title="Add YouTube video"
        >
          <YoutubeIcon className="tiptap-button-icon" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="youtube-popover-content" align="start">
        <div className="youtube-form">
          <div className="youtube-form-header">
            <h3>Add YouTube Video</h3>
          </div>
          
          <div className="youtube-form-body">
            <div className="youtube-input-group">
              <label htmlFor="youtube-url">YouTube URL</label>
              <Input
                id="youtube-url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  if (error) setError("")
                }}
                autoFocus
              />
              {error && <span className="youtube-error">{error}</span>}
              <div className="youtube-info">
                Video will be responsive with 16:9 aspect ratio
              </div>
            </div>
          </div>

          <div className="youtube-form-footer">
            <Button
              data-style="ghost"
              onClick={handleClose}
              className="youtube-cancel-button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="youtube-submit-button"
            >
              Add Video
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Export component không cần editor prop cho mobile
export function YoutubePopoverButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      data-style="ghost"
      onClick={onClick}
      aria-label="Add YouTube video"
      title="Add YouTube video"
    >
      <YoutubeIcon className="tiptap-button-icon" />
    </Button>
  )
}

// Content cho mobile popover
export function YoutubePopoverContent() {
  const { editor } = useContext(EditorContext)
  const [url, setUrl] = useState("")
  const [error, setError] = useState("")

  const validateYoutubeUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    return youtubeRegex.test(url)
  }

  const handleSubmit = () => {
    if (!editor) return

    if (!url.trim()) {
      setError("Please enter a YouTube URL")
      return
    }

    if (!validateYoutubeUrl(url)) {
      setError("Please enter a valid YouTube URL")
      return
    }

    // Auto set width to 100% and calculate height with 16:9 ratio
    editor.commands.setYoutubeVideo({
      src: url,
      width: 640, // Default width, will be overridden by CSS
      height: 360, // 16:9 ratio
    })

    // Reset form
    setUrl("")
    setError("")
  }

  return (
    <div className="youtube-mobile-content">
      <div className="youtube-input-group">
        <label htmlFor="youtube-url-mobile">YouTube URL</label>
        <Input
          id="youtube-url-mobile"
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={(e) => {
            setUrl(e.target.value)
            if (error) setError("")
          }}
        />
        {error && <span className="youtube-error">{error}</span>}
        <div className="youtube-info">
          Video will be responsive with 16:9 aspect ratio
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        className="youtube-mobile-submit"
      >
        Add Video
      </Button>
    </div>
  )
}