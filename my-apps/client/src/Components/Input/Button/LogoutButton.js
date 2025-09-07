import { logout } from '../../../Store/authSlice';

const LogoutButton = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logout(navigate)).unwrap();
  };

  return <button onClick={handleLogout}>Logout</button>;
};