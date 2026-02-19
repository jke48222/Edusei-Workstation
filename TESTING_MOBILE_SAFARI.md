# Testing Mobile Safari During Development

## Option 1: Local Network Access (Easiest - Real Device)

### Step 1: Configure Vite for Network Access

Update `vite.config.ts` to allow connections from your local network:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5173,
    strictPort: false,
  },
})
```

### Step 2: Find Your Local IP Address

**Windows:**
```powershell
ipconfig
# Look for IPv4 Address under your active network adapter
# Example: 192.168.1.100
```

**Mac/Linux:**
```bash
ifconfig | grep "inet "
# Or
ip addr show
```

### Step 3: Start Dev Server

```bash
npm run dev
```

Vite will show:
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
```

### Step 4: Access from iPhone/iPad

1. Make sure your iPhone/iPad is on the **same Wi-Fi network** as your computer
2. Open Safari on your iPhone/iPad
3. Navigate to: `http://192.168.1.100:5173` (use your actual IP)
4. Test your videos!

**Note:** You may need to allow the connection in Windows Firewall when first connecting.

---

## Option 2: ngrok (Tunnel - Works Anywhere)

### Setup ngrok:

1. **Sign up** at https://ngrok.com (free account)
2. **Download** ngrok for Windows
3. **Authenticate:**
   ```powershell
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

### Start Tunnel:

**Terminal 1:** Start your dev server
```bash
npm run dev
```

**Terminal 2:** Start ngrok tunnel
```powershell
ngrok http 5173
```

ngrok will give you a URL like:
```
Forwarding: https://abc123.ngrok.io -> http://localhost:5173
```

### Access from iPhone:

1. Open Safari on iPhone/iPad
2. Navigate to the ngrok URL (e.g., `https://abc123.ngrok.io`)
3. Test your videos!

**Benefits:**
- Works from anywhere (not just same network)
- HTTPS (required for some features)
- Can share with others for testing

---

## Option 3: Browser DevTools (Quick Testing)

### Chrome DevTools Mobile Emulation:

1. Open Chrome DevTools (F12)
2. Click device toolbar icon (Ctrl+Shift+M)
3. Select "iPhone" or "iPad" from device dropdown
4. **Note:** This simulates mobile Safari but may not perfectly match real Safari behavior

### Safari Desktop (macOS only):

1. Enable Developer menu: Safari → Preferences → Advanced → "Show Develop menu"
2. Develop → User Agent → iOS Safari
3. **Note:** Still desktop Safari, not true mobile Safari

**Limitations:**
- May not perfectly match mobile Safari behavior
- Video transparency might behave differently
- Touch events may not work correctly

---

## Option 4: Cloud Testing Services (Free Tiers Available)

### BrowserStack (Free Trial):
1. Sign up at https://www.browserstack.com
2. Free trial includes real device testing
3. Select iPhone → Safari
4. Enter your ngrok URL or deployed URL

### LambdaTest (Free Tier):
1. Sign up at https://www.lambdatest.com
2. Free tier includes limited mobile testing
3. Test on real iOS devices

---

## Option 5: iOS Simulator (macOS only)

If you have access to a Mac:

1. Install Xcode
2. Open iOS Simulator
3. Navigate to your local dev server
4. Test Safari in the simulator

---

## Recommended Approach

**For best results:**

1. **Use Option 1 (Local Network)** - Real device, same network
   - Most accurate testing
   - Free
   - Requires same Wi-Fi network

2. **Use Option 2 (ngrok)** - If you need to test from different network
   - Works anywhere
   - Free tier available
   - HTTPS support

3. **Combine with DevTools** - For quick checks
   - Fast iteration
   - Not perfect but good for initial testing

---

## Quick Test Checklist

When testing on mobile Safari:

- [ ] Videos load correctly
- [ ] Transparency works (check background shows through)
- [ ] Theme switching works smoothly
- [ ] Transition videos play correctly
- [ ] Videos stay on last frame (don't loop)
- [ ] Performance is smooth
- [ ] No black backgrounds on videos

---

## Troubleshooting

**"Can't connect to server"**
- Check firewall settings
- Ensure same Wi-Fi network
- Verify IP address is correct
- Try disabling VPN

**"Videos still have black background"**
- Verify HEVC files are in `public/videos/hevc/`
- Check browser console for errors
- Ensure files are actually HEVC with alpha (not just renamed)
- Try clearing browser cache

**"ngrok connection refused"**
- Make sure dev server is running
- Verify port matches (5173)
- Check ngrok is pointing to correct port
