'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, StickyNote, Pin, PinOff, MoreHorizontal, Trash2, Edit, Search } from 'lucide-react';
import { useNotes } from '@/lib/hooks/use-notes';
import { NoteForm } from '@/components/notes/note-form';
import { Note } from '@/lib/db/schema';
import { MarkdownRenderer } from '@/components/shared/markdown-renderer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function NotesPage() {
  const { notes, addNote, updateNote, deleteNote, togglePin } = useNotes();
  const [showForm, setShowForm] = useState(false);
  const [editNote, setEditNote] = useState<Note | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = [...new Set(notes.flatMap((n) => n.tags))];

  const filteredNotes = notes.filter((note) => {
    const matchesSearch = !searchQuery ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || note.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleEdit = (note: Note) => {
    setEditNote(note);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu notu silmek istediğine emin misin?')) {
      await deleteNote(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notlar</h1>
          <p className="text-muted-foreground">{notes.length} not</p>
        </div>
        <Button onClick={() => { setEditNote(undefined); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Not
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Notlarda ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        {allTags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            <Button
              variant={selectedTag === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTag(null)}
            >
              Tümü
            </Button>
            {allTags.slice(0, 8).map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              >
                {tag}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <StickyNote className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">
                {searchQuery || selectedTag ? 'Sonuç bulunamadı' : 'Henüz not yok'}
              </h3>
              <p className="mb-4">
                {searchQuery || selectedTag ? 'Farklı bir arama yapmayı dene' : 'İlk notunu oluşturarak başla'}
              </p>
              {!searchQuery && !selectedTag && (
                <Button onClick={() => { setEditNote(undefined); setShowForm(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  İlk Notu Oluştur
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <Card
              key={note.id}
              className="group hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleEdit(note)}
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2 min-w-0">
                  {note.pinned && <Pin className="w-4 h-4 text-yellow-500 shrink-0" />}
                  <CardTitle className="text-base truncate">{note.title}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={(e: React.MouseEvent) => e.stopPropagation()} />}>
                    <MoreHorizontal className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); togglePin(note.id); }}>
                      {note.pinned ? (
                        <>
                          <PinOff className="w-4 h-4 mr-2" />
                          Sabitlemeyi Kaldır
                        </>
                      ) : (
                        <>
                          <Pin className="w-4 h-4 mr-2" />
                          Sabitle
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(note); }}>
                      <Edit className="w-4 h-4 mr-2" />
                      Düzenle
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Sil
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                {note.content && (
                  <div className="text-sm text-muted-foreground line-clamp-3 mb-3 [&_.wikilink]:pointer-events-none">
                    <MarkdownRenderer content={note.content} />
                  </div>
                )}
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(note.updatedAt).toLocaleDateString('tr-TR')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <NoteForm
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={editNote ? (data) => updateNote(editNote.id, data) : addNote}
        initialData={editNote}
      />
    </div>
  );
}
