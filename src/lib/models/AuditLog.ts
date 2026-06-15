import mongoose, { Schema, model, models } from "mongoose";

export interface IAuditLog {
  actor: mongoose.Types.ObjectId | string;
  actorName: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actor: { type: Schema.Types.Mixed, required: true },
    actorName: { type: String, required: true },
    actorEmail: { type: String, required: true },
    action: { type: String, required: true },
    targetType: { type: String, required: true },
    targetId: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

auditLogSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
auditLogSchema.index({ actorEmail: 1, createdAt: -1 });

export const AuditLog = models.AuditLog || model<IAuditLog>("AuditLog", auditLogSchema);
