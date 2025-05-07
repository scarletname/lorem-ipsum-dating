import { Card, CardMedia, CardContent, Typography, Button } from '@mui/material';

const Profile = ({ user }) => {
  return (
    <Card sx={{ maxWidth: 400, width: '100%', mx: 'auto', p: 3, borderRadius: 4, boxShadow: 3 }}>
      <CardMedia
        component="img"
        height="256"
        image={user.image}
        alt={user.name}
        sx={{ borderRadius: 3, objectFit: 'cover' }}
      />
      <CardContent>
        <Typography variant="h6" fontWeight="bold" mt={2}>
          {user.name}, {user.age}
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          {user.bio}
        </Typography>
        <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Редактировать профиль
        </Button>
      </CardContent>
    </Card>
  );
};

export default Profile;
