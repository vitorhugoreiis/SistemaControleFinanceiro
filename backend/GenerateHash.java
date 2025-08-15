import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GenerateHash {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
        
        String senha = "admin123";
        String hash = encoder.encode(senha);
        
        System.out.println("Senha: " + senha);
        System.out.println("Hash BCrypt (força 12): " + hash);
        
        // Verificar se o hash funciona
        boolean matches = encoder.matches(senha, hash);
        System.out.println("Verificação: " + matches);
    }
}