import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { Edit2, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/db";
import { todosTable } from "@/db/schema";

export const Route = createFileRoute("/_authenticated/drizzle")({
    component: RouteComponent,
});

interface Todo {
    completed: number;
    createdAt: number;
    description: string | null;
    id: number;
    title: string;
}

const todoSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
});

function RouteComponent() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    // Load todos from database
    const loadTodos = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await db.select().from(todosTable);
            setTodos(result as Todo[]);
        } catch (error) {
            console.error("Failed to load todos:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load todos on component mount
    useEffect(() => {
        loadTodos();
    }, [loadTodos]);

    // Create form
    const form = useForm({
        defaultValues: {
            title: "",
            description: "",
        },
        onSubmit: async ({ value }) => {
            try {
                if (editingId) {
                    await db
                        .update(todosTable)
                        .set({
                            title: value.title,
                            description: value.description || null,
                        })
                        .where(eq(todosTable.id, editingId));
                    setEditingId(null);
                } else {
                    await db.insert(todosTable).values({
                        title: value.title,
                        description: value.description || null,
                        completed: 0,
                        createdAt: Date.now(),
                    });
                }
                form.reset();
                await loadTodos();
            } catch (error) {
                console.error("Failed to save todo:", error);
            }
        },
    });

    const validateTitle = (value: string): string | undefined => {
        const result = todoSchema.shape.title.safeParse(value);
        return result.success ? undefined : result.error.issues[0]?.message;
    };

    const handleEdit = (todo: Todo) => {
        setEditingId(todo.id);
        form.setFieldValue("title", todo.title);
        form.setFieldValue("description", todo.description || "");
    };

    const handleCancel = () => {
        setEditingId(null);
        form.reset();
    };

    const handleDelete = async (id: number) => {
        try {
            await db.delete(todosTable).where(eq(todosTable.id, id));
            await loadTodos();
        } catch (error) {
            console.error("Failed to delete todo:", error);
        }
    };

    const handleToggleComplete = async (id: number) => {
        try {
            const todo = todos.find((t) => t.id === id);
            if (todo) {
                await db
                    .update(todosTable)
                    .set({
                        completed: todo.completed ? 0 : 1,
                    })
                    .where(eq(todosTable.id, id));
                await loadTodos();
            }
        } catch (error) {
            console.error("Failed to update todo:", error);
        }
    };

    const renderTodosList = () => {
        if (isLoading) {
            return (
                <div className="py-8 text-center text-muted-foreground">
                    Loading todos...
                </div>
            );
        }

        if (todos.length === 0) {
            return (
                <div className="rounded-lg border border-dashed py-8 text-center text-muted-foreground">
                    No todos yet. Create one to get started!
                </div>
            );
        }

        return (
            <div className="space-y-2">
                {todos.map((todo) => (
                    <Card
                        className={`p-4 transition-opacity ${todo.completed ? "opacity-60" : ""
                            }`}
                        key={todo.id}
                    >
                        <div className="flex items-start gap-4">
                            <Checkbox
                                checked={Boolean(todo.completed)}
                                className="mt-1"
                                onCheckedChange={() => handleToggleComplete(todo.id)}
                            />
                            <div className="min-w-0 flex-1">
                                <h3
                                    className={`font-medium ${todo.completed ? "text-muted-foreground line-through" : ""
                                        }`}
                                >
                                    {todo.title}
                                </h3>
                                {todo.description && (
                                    <p className="mt-1 text-muted-foreground text-sm">
                                        {todo.description}
                                    </p>
                                )}
                                <p className="mt-2 text-muted-foreground text-xs">
                                    {new Date(todo.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    disabled={form.state.isSubmitting}
                                    onClick={() => handleEdit(todo)}
                                    size="sm"
                                    variant="ghost"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                    className="text-destructive hover:text-destructive"
                                    disabled={form.state.isSubmitting}
                                    onClick={() => handleDelete(todo.id)}
                                    size="sm"
                                    variant="ghost"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="mx-auto max-w-2xl">
                <div className="mb-8">
                    <h1 className="mb-2 font-bold text-3xl">Todo App</h1>
                    <p className="text-muted-foreground">
                        Manage your tasks with full CRUD operations
                    </p>
                </div>

                {/* Add/Edit Todo Form */}
                <Card className="mb-8 p-6">
                    <form
                        className="space-y-4"
                        onSubmit={async (e) => {
                            e.preventDefault();
                            await form.handleSubmit();
                        }}
                    >
                        <FieldGroup>
                            <form.Field
                                name="title"
                                validators={{
                                    onBlur: ({ value }) => validateTitle(value),
                                    onSubmit: ({ value }) => validateTitle(value),
                                }}
                            >
                                {(field) => {
                                    const errorMessage =
                                        typeof field.state.meta.errors[0] === "string"
                                            ? field.state.meta.errors[0]
                                            : undefined;
                                    return (
                                        <Field data-invalid={Boolean(errorMessage)}>
                                            <FieldLabel>Title</FieldLabel>
                                            <Input
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                placeholder="Enter todo title"
                                                value={field.state.value}
                                            />
                                            <FieldError>{errorMessage}</FieldError>
                                        </Field>
                                    );
                                }}
                            </form.Field>

                            <form.Field name="description">
                                {(field) => (
                                    <Field>
                                        <FieldLabel>Description</FieldLabel>
                                        <Textarea
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            placeholder="Enter todo description (optional)"
                                            rows={3}
                                            value={field.state.value}
                                        />
                                    </Field>
                                )}
                            </form.Field>
                        </FieldGroup>

                        <div className="flex gap-2">
                            <Button
                                className="flex-1"
                                disabled={form.state.isSubmitting}
                                type="submit"
                            >
                                {editingId ? "Update Todo" : "Add Todo"}
                            </Button>
                            {editingId && (
                                <Button
                                    disabled={form.state.isSubmitting}
                                    onClick={handleCancel}
                                    type="button"
                                    variant="outline"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </form>
                </Card>

                {/* Todos List */}
                <div className="space-y-3">
                    <h2 className="font-semibold text-lg">Todos ({todos.length})</h2>
                    {renderTodosList()}
                </div>
            </div>
        </div>
    );
}
