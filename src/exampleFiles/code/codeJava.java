import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class ToggleBackground {
    public static void main(String[] args) {
        // Create the JFrame (main window)
        JFrame frame = new JFrame("Toggle Background");
        frame.setSize(400, 300);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        
        // Create a button
        JButton button = new JButton("Toggle Background");
        frame.add(button, BorderLayout.SOUTH);
        
        // Set initial background color
        JPanel panel = new JPanel();
        panel.setBackground(Color.WHITE);
        frame.add(panel, BorderLayout.CENTER);
        
        // Add action listener to toggle background color
        button.addActionListener(new ActionListener() {
            private boolean isBlue = false;
            
            @Override
            public void actionPerformed(ActionEvent e) {
                if (isBlue) {
                    panel.setBackground(Color.WHITE);
                } else {
                    panel.setBackground(Color.CYAN);
                }
                isBlue = !isBlue;
            }
        });

        // Make the frame visible
        frame.setVisible(true);
    }
}
