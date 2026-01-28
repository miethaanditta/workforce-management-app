import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupsIcon from '@mui/icons-material/Groups';
import MonitorIcon from '@mui/icons-material/Monitor';
import { useNavigate } from 'react-router-dom';

const cards = [
    {
        icon: <PersonAddIcon sx={{ fontSize: '5rem', color: 'primary.main' }} />,
        title: 'CREATE',
        description: 'Create new account and profile for new employee.',
        redirection: '/employee/create',
    },
    {
        icon: <GroupsIcon sx={{ fontSize: '5rem', color: 'primary.main' }} />,
        title: 'MAINTAIN',
        description: 'Maintain existing employee.',
        redirection: '/employee',
    },
    {
        icon: <MonitorIcon sx={{ fontSize: '5rem', color: 'primary.main' }} />,
        title: 'MONITOR',
        description: 'Monitor every employee attendance.',
        redirection: '/attendance',
    },
];

export default function AdminDashboard() {
    const navigate = useNavigate();
    
    return (
        <Box
            sx={{
                my: 'auto',
                mx: 'auto',
                display: 'grid',
                padding: '5rem',
                gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(auto-fill, minmax(350px, 1fr))'
                },
                gap: 2,
            }}
        >
            {cards.map((card) => (
                <Card key={card.title} sx={{ height: { xs: 250, sm: 350 } }} >
                    <CardActionArea
                        onClick={() => navigate(card.redirection)}
                        sx={{
                            height: '100%',
                            '&[data-active]': {
                                backgroundColor: 'action.selected',
                                '&:hover': {
                                    backgroundColor: 'action.selectedHover',
                                },
                            },
                        }}
                    >
                        <CardContent sx={{ height: '100%' }}>
                            {card.icon}
                            <Typography variant="h2" component="div">
                                {card.title}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {card.description}
                            </Typography>
                        </CardContent>
                    </CardActionArea>
                </Card>
            ))}
        </Box>
    );
}
