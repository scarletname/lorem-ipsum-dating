import { Card, CardMedia, CardContent, Typography, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

const SwipeCard = ({ user }) => {
  return (
    <Box sx={{ width: { xs: '95%', sm: '90%' }, mx: 'auto', mb: 2 }}>
      <Card sx={{ position: 'relative', borderRadius: 4, boxShadow: 3 }}>
        <CardMedia
          component="img"
          height={{ xs: 240, sm: 384 }}
          image={user.image}
          alt={user.name}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            {user.name}, {user.age}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.bio}
          </Typography>
        </CardContent>
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <IconButton sx={{ bgcolor: 'red.500', color: 'white', width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 } }}>
            <CloseIcon fontSize="medium" />
          </IconButton>
          <IconButton sx={{ bgcolor: 'green.500', color: 'white', width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 } }}>
            <CheckIcon fontSize="medium" />
          </IconButton>
        </Box>
      </Card>
    </Box>
  );
};

export default SwipeCard;
