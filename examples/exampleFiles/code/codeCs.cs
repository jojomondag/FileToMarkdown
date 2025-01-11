using System;
using System.Drawing;
using System.Windows.Forms;

public class ToggleBackgroundForm : Form
{
    private bool isBlue = false; // State variable to track the current background color
    private Button toggleButton;

    public ToggleBackgroundForm()
    {
        // Set up the form
        this.Text = "Toggle Background";
        this.Size = new Size(400, 300);

        // Create and configure the button
        toggleButton = new Button();
        toggleButton.Text = "Toggle Background";
        toggleButton.Size = new Size(200, 50);
        toggleButton.Location = new Point(100, 100);
        toggleButton.Click += ToggleBackground; // Add click event handler

        // Add the button to the form
        this.Controls.Add(toggleButton);
    }

    // Event handler to toggle the background color
    private void ToggleBackground(object sender, EventArgs e)
    {
        if (isBlue)
        {
            this.BackColor = Color.White;
        }
        else
        {
            this.BackColor = Color.LightBlue;
        }
        isBlue = !isBlue;
    }

    [STAThread]
    public static void Main()
    {
        Application.EnableVisualStyles();
        Application.Run(new ToggleBackgroundForm());
    }
}
