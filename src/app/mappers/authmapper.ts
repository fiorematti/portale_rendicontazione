import { AuthResponse } from "../dto/authresponsdto";
import { User, UserRole } from "../dto/userdto";

// Mappa il DTO di login in un'entità di dominio User
export const mapAuthResponseToUser = (dto: AuthResponse): User => {
  const normalizedRole = dto.ruolo?.toLowerCase() ?? "";
  const role: UserRole = normalizedRole === "admin" ? UserRole.ADMIN : UserRole.USER;
 
  return {
    id: String(dto.idUtente),
    name: dto.nome,
    surname: dto.cognome,
    email: dto.email,
    role,
  };
};