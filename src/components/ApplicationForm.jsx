import React, { useState } from 'react';
import { Button, Modal, TextField, CircularProgress, Box, Typography, IconButton } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@clerk/clerk-react';
import { toast } from 'react-hot-toast';
import { CloudUpload as CloudUploadIcon, Close as CloseIcon } from '@mui/icons-material';
import api from '../utils/api';

const applicationSchema = z.object({
  coverLetter: z.string().min(1, 'Cover letter is required'),
  resume: z.any().optional(),
});

const ApplicationForm = ({ open, onClose, job, onSuccess }) => {
  const { getToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      coverLetter: '',
      resume: null,
    }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const toastId = toast.loading('Submitting application...');

    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('coverLetter', data.coverLetter);
      if (data.resume && data.resume[0]) {
        formData.append('resume', data.resume[0]);
      }

      const res = await api.post(`/applications/${job._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      toast.success('Application submitted successfully!', { id: toastId });
      reset();
      onSuccess(res.data);
      onClose();
    } catch (error) {
      console.error('Application submission error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to submit application. Please try again.';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Apply for {job?.title}</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Controller
            name="coverLetter"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Cover Letter"
                multiline
                rows={4}
                variant="outlined"
                fullWidth
                margin="normal"
                error={!!errors.coverLetter}
                helperText={errors.coverLetter?.message}
                required
              />
            )}
          />

          <Button
            variant="contained"
            component="label"
            fullWidth
            startIcon={<CloudUploadIcon />}
            sx={{ mt: 2, mb: 1 }}
          >
            Upload Resume (PDF)
            <Controller
              name="resume"
              control={control}
              render={({ field }) => (
                <input
                  type="file"
                  hidden
                  accept=".pdf"
                  onChange={(e) => field.onChange(e.target.files)}
                />
              )}
            />
          </Button>
          {errors.resume && <Typography color="error" variant="caption">{errors.resume.message}</Typography>}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={isSubmitting}
            sx={{ mt: 2 }}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Submit Application'}
          </Button>
        </form>
      </Box>
    </Modal>
  );
};

export default ApplicationForm;
