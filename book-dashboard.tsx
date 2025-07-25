"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Book, Plus, Search, BookOpen, Calendar, User, Tag, Upload, X, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BookData {
  id: string
  title: string
  author: string
  genre: string
  publishedYear: number
  coverImage: string
}

const genres = [
  "Classic Literature",
  "Fiction",
  "Non-Fiction",
  "Science Fiction",
  "Fantasy",
  "Mystery",
  "Romance",
  "Thriller",
  "Biography",
  "History",
  "Self-Help",
  "Poetry",
  "Drama",
  "Horror",
  "Adventure",
]

const initialBooks: BookData[] = [
  {
    id: "1",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    genre: "Classic Literature",
    publishedYear: 1925,
    coverImage: "/placeholder.svg?height=120&width=80&text=Gatsby",
  },
  {
    id: "2",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    genre: "Fiction",
    publishedYear: 1960,
    coverImage: "/placeholder.svg?height=120&width=80&text=Mockingbird",
  },
  {
    id: "3",
    title: "1984",
    author: "George Orwell",
    genre: "Science Fiction",
    publishedYear: 1949,
    coverImage: "/placeholder.svg?height=120&width=80&text=1984",
  },
  {
    id: "4",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    genre: "Romance",
    publishedYear: 1813,
    coverImage: "/placeholder.svg?height=120&width=80&text=Pride",
  },
  {
    id: "5",
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    genre: "Fiction",
    publishedYear: 1951,
    coverImage: "/placeholder.svg?height=120&width=80&text=Catcher",
  },
  {
    id: "6",
    title: "Dune",
    author: "Frank Herbert",
    genre: "Science Fiction",
    publishedYear: 1965,
    coverImage: "/placeholder.svg?height=120&width=80&text=Dune",
  },
  {
    id: "7",
    title: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    publishedYear: 1954,
    coverImage: "/placeholder.svg?height=120&width=80&text=LOTR",
  },
  {
    id: "8",
    title: "Harry Potter and the Philosopher's Stone",
    author: "J.K. Rowling",
    genre: "Fantasy",
    publishedYear: 1997,
    coverImage: "/placeholder.svg?height=120&width=80&text=Potter",
  },
]

export default function BookDashboard() {
  const [books, setBooks] = useState<BookData[]>(initialBooks)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    genre: "",
    publishedYear: "",
  })
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.genre.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const uploadImageToBlob = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Upload failed")
      }

      const { url } = await response.json()
      return url
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      })
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        })
        return
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file",
          variant: "destructive",
        })
        return
      }

      setImageFile(file)

      // Show preview immediately
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to Vercel Blob in the background
      const uploadedUrl = await uploadImageToBlob(file)
      if (uploadedUrl) {
        setUploadedImageUrl(uploadedUrl)
        toast({
          title: "Image Uploaded",
          description: "Book cover has been uploaded successfully",
          className: "border-green-200 bg-green-50 text-green-900",
        })
      }
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImageFile(null)
    setUploadedImageUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.author || !formData.genre || !formData.publishedYear) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (isUploading) {
      toast({
        title: "Please Wait",
        description: "Image is still uploading. Please wait a moment.",
        variant: "destructive",
      })
      return
    }

    const newBook: BookData = {
      id: Date.now().toString(),
      title: formData.title,
      author: formData.author,
      genre: formData.genre,
      publishedYear: Number.parseInt(formData.publishedYear),
      coverImage:
        uploadedImageUrl || selectedImage || `/placeholder.svg?height=120&width=80&text=${formData.title.slice(0, 8)}`,
    }

    setBooks((prev) => [...prev, newBook])
    setFormData({ title: "", author: "", genre: "", publishedYear: "" })
    setSelectedImage(null)
    setImageFile(null)
    setUploadedImageUrl(null)
    setIsDialogOpen(false)

    toast({
      title: "Success! 📚",
      description: `"${newBook.title}" has been added to your library`,
      className: "border-green-200 bg-green-50 text-green-900",
    })
  }

  const getGenreColor = (genre: string) => {
    const colors = {
      "Classic Literature": "bg-blue-100 text-blue-800 border-blue-200",
      Fiction: "bg-green-100 text-green-800 border-green-200",
      "Science Fiction": "bg-purple-100 text-purple-800 border-purple-200",
      Fantasy: "bg-pink-100 text-pink-800 border-pink-200",
      Romance: "bg-rose-100 text-rose-800 border-rose-200",
      Mystery: "bg-gray-100 text-gray-800 border-gray-200",
      Thriller: "bg-red-100 text-red-800 border-red-200",
      "Non-Fiction": "bg-yellow-100 text-yellow-800 border-yellow-200",
      Biography: "bg-indigo-100 text-indigo-800 border-indigo-200",
      History: "bg-amber-100 text-amber-800 border-amber-200",
      "Self-Help": "bg-teal-100 text-teal-800 border-teal-200",
      Poetry: "bg-violet-100 text-violet-800 border-violet-200",
      Drama: "bg-orange-100 text-orange-800 border-orange-200",
      Horror: "bg-slate-100 text-slate-800 border-slate-200",
      Adventure: "bg-emerald-100 text-emerald-800 border-emerald-200",
    }
    return colors[genre as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const uniqueAuthors = new Set(books.map((book) => book.author)).size
  const uniqueGenres = new Set(books.map((book) => book.genre)).size
  const latestYear = books.length > 0 ? Math.max(...books.map((book) => book.publishedYear)) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Book Management Dashboard</h1>
                <p className="text-sm text-gray-600">Organize and manage your personal library</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add New Book
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <Book className="h-6 w-6 text-blue-600" />
                    Add New Book
                  </DialogTitle>
                  <DialogDescription>Fill in the details below to add a new book to your collection.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Image Upload Section */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Book Cover</Label>
                    <div className="flex flex-col items-center space-y-4">
                      {selectedImage ? (
                        <div className="relative">
                          <img
                            src={selectedImage || "/placeholder.svg"}
                            alt="Book cover preview"
                            className="h-32 w-24 rounded-lg object-cover shadow-md border-2 border-gray-200"
                          />
                          {isUploading && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                              <Loader2 className="h-6 w-6 text-white animate-spin" />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={removeImage}
                            disabled={isUploading}
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600 flex items-center justify-center shadow-sm disabled:opacity-50"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          {uploadedImageUrl && (
                            <div className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full bg-green-500 text-white flex items-center justify-center shadow-sm">
                              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="flex h-32 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <Upload className="h-8 w-8 text-gray-400" />
                          <span className="mt-2 text-xs text-gray-500 text-center px-2">Click to upload cover</span>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <p className="text-xs text-gray-500 text-center">Supports JPG, PNG, GIF up to 5MB</p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="flex items-center gap-2 text-sm font-medium">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                        Book Title *
                      </Label>
                      <Input
                        id="title"
                        placeholder="Enter book title"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        className="focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="author" className="flex items-center gap-2 text-sm font-medium">
                        <User className="h-4 w-4 text-blue-600" />
                        Author *
                      </Label>
                      <Input
                        id="author"
                        placeholder="Enter author name"
                        value={formData.author}
                        onChange={(e) => handleInputChange("author", e.target.value)}
                        className="focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="genre" className="flex items-center gap-2 text-sm font-medium">
                        <Tag className="h-4 w-4 text-blue-600" />
                        Genre *
                      </Label>
                      <Select value={formData.genre} onValueChange={(value) => handleInputChange("genre", value)}>
                        <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                          <SelectValue placeholder="Select a genre" />
                        </SelectTrigger>
                        <SelectContent>
                          {genres.map((genre) => (
                            <SelectItem key={genre} value={genre}>
                              {genre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="publishedYear" className="flex items-center gap-2 text-sm font-medium">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        Published Year *
                      </Label>
                      <Input
                        id="publishedYear"
                        type="number"
                        min="1000"
                        max={new Date().getFullYear()}
                        placeholder="Enter published year"
                        value={formData.publishedYear}
                        onChange={(e) => handleInputChange("publishedYear", e.target.value)}
                        className="focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={isUploading}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        "Add Book"
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Summary Cards */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Books</CardTitle>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Book className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{books.length}</div>
              <p className="text-xs text-gray-500 mt-1">Books in collection</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Unique Authors</CardTitle>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <User className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{uniqueAuthors}</div>
              <p className="text-xs text-gray-500 mt-1">Different authors</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Number of Genres</CardTitle>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <Tag className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{uniqueGenres}</div>
              <p className="text-xs text-gray-500 mt-1">Genre categories</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Latest Published Year</CardTitle>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{latestYear}</div>
              <p className="text-xs text-gray-500 mt-1">Most recent publication</p>
            </CardContent>
          </Card>
        </div>

        {/* Books Table */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="border-b border-gray-100">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl text-gray-900">Book Collection</CardTitle>
                <CardDescription className="text-gray-600">Manage and browse your personal library</CardDescription>
              </div>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search books, authors, or genres..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 focus:ring-2 focus:ring-blue-500 border-gray-200"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold text-gray-700 w-20">Cover</TableHead>
                    <TableHead className="font-semibold text-gray-700">Title</TableHead>
                    <TableHead className="font-semibold text-gray-700">Author</TableHead>
                    <TableHead className="font-semibold text-gray-700">Genre</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-right">Published Year</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBooks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center space-y-3">
                          <BookOpen className="h-12 w-12 text-gray-300" />
                          <p className="text-gray-500 font-medium">
                            {searchTerm ? "No books found matching your search." : "No books in your collection yet."}
                          </p>
                          {!searchTerm && <p className="text-sm text-gray-400">Add your first book to get started!</p>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBooks.map((book) => (
                      <TableRow key={book.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="py-4">
                          <img
                            src={book.coverImage || "/placeholder.svg"}
                            alt={`${book.title} cover`}
                            className="h-16 w-12 rounded-md object-cover shadow-sm border border-gray-200"
                          />
                        </TableCell>
                        <TableCell className="font-medium text-gray-900 py-4">
                          <div className="max-w-xs">
                            <p className="truncate">{book.title}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-700 py-4">
                          <div className="max-w-xs">
                            <p className="truncate">{book.author}</p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge variant="secondary" className={`${getGenreColor(book.genre)} font-medium border`}>
                            {book.genre}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-gray-700 font-medium py-4">
                          {book.publishedYear}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  )
}
