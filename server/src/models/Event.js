import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    event_id: {
      type: String,
      required: [true, 'event_id is required'],
      unique: true,
      trim: true,
    },
    session_id: {
      type: String,
      required: [true, 'session_id is required'],
      trim: true,
      index: true,
    },
    event_type: {
      type: String,
      required: [true, 'event_type is required'],
      enum: {
        values: ['page_view', 'click'],
        message: '{VALUE} is not a supported event type. Allowed: page_view, click',
      },
      trim: true,
    },
    page_url: {
      type: String,
      required: [true, 'page_url is required'],
      trim: true,
    },
    timestamp: {
      type: Date,
      required: [true, 'timestamp is required'],
      default: Date.now,
    },
    click_x: {
      type: Number,
      required: function () {
        return this.event_type === 'click';
      },
      min: [0, 'click_x cannot be negative'],
    },
    click_y: {
      type: Number,
      required: function () {
        return this.event_type === 'click';
      },
      min: [0, 'click_y cannot be negative'],
    },
    viewport_width: {
      type: Number,
      min: [0, 'viewport_width cannot be negative'],
    },
    viewport_height: {
      type: Number,
      min: [0, 'viewport_height cannot be negative'],
    },
    page_title: {
      type: String,
      trim: true,
      default: '',
    },
    referrer: {
      type: String,
      trim: true,
      default: '',
    },
    element_tag: {
      type: String,
      trim: true,
      default: '',
    },
    element_id: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound indexes for optimal aggregation & query performance:
// 1. Session timeline & details: session_id with chronological timestamp
eventSchema.index({ session_id: 1, timestamp: 1 });

// 2. Heatmap & page click queries: filter by page_url and event_type
eventSchema.index({ page_url: 1, event_type: 1 });

// 3. Chronological sorting across all events
eventSchema.index({ timestamp: -1 });

export const Event = mongoose.model('Event', eventSchema);
export default Event;
